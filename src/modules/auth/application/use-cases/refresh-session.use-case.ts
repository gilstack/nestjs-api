// internal
import { TypedConfigService } from '@config/config.service';
import { Inject, Injectable } from '@nestjs/common';
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
  ) {}

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

    // Rotate Request Token
    const newRefreshToken = this.tokenService.generateRandomToken();
    const newRefreshTokenHash = await this.tokenService.hashToken(newRefreshToken);
    const newRefreshExpiresAt = new Date(Date.now() + this.tokenService.getRefreshTokenExpiresInMs());

    await this.sessionRepository.update(session.id, {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: newRefreshExpiresAt,
    });

    const newRefreshTokenJwt = this.tokenService.generateRefreshToken({
        sub: user.id,
        sid: session.id,
        type: 'refresh',
    });

    const isSecure = this.config.auth.cookieSecure;

    response.cookie('access', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: this.tokenService.getAccessTokenExpiresInMs(),
    });

    response.cookie('refresh', newRefreshTokenJwt, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/api/auth/refresh',
        maxAge: this.tokenService.getRefreshTokenExpiresInMs(),
    });

    this.logger.info('Session refreshed and rotated', { userId: user.id });

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
