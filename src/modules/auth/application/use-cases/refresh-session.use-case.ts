import { Inject, Injectable } from '@nestjs/common';

// internal
import { TypedConfigService } from '@config/config.service';
import { LOGGER_SERVICE, REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { FastifyReply, FastifyRequest } from 'fastify';

// relatives
import { AuthException } from '../../domain/exceptions/auth.exception';
import type { ISessionRepository } from '../../domain/repositories/session.repository';
import type { AuthResponseDto } from '../dtos';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: ISessionRepository,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly config: TypedConfigService,
  ) { }

  async execute(request: FastifyRequest, response: FastifyReply): Promise<AuthResponseDto> {
    const refreshTokenJwt = (request.cookies as Record<string, string>)?.refresh;

    if (!refreshTokenJwt) {
      throw AuthException.refreshTokenMissing();
    }

    let payload: ReturnType<typeof this.tokenService.verifyRefreshToken>;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshTokenJwt);
    } catch {
      throw AuthException.refreshTokenInvalid();
    }

    const session = await this.sessionRepository.findById(payload.sid);

    if (!session || session.isExpired()) {
      throw AuthException.sessionExpired();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        accounts: {
          where: { provider: 'EMAIL' },
          take: 1,
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw AuthException.userInactive();
    }

    const email = user.accounts[0]?.identifier || '';

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email,
      role: user.role,
      type: 'access',
    });

    const isSecure = this.config.auth.cookieSecure;

    response.cookie('access', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: this.tokenService.getAccessTokenExpiresInMs(),
    });

    this.logger.info('Session refreshed', { userId: user.id });

    return {
      user: {
        id: user.id,
        email,
        username: user.username,
        tag: user.tag,
        name: user.name,
        image: user.image,
        role: user.role,
        status: user.status,
      },
    };
  }
}

