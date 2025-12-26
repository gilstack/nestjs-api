import { Inject, Injectable } from '@nestjs/common';

// internal
import { TypedConfigService } from '@config/config.service';
import { LOGGER_SERVICE, REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { FastifyReply, FastifyRequest } from 'fastify';

// user module
import type { User } from '@modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@modules/user/domain/repositories/user.repository';

// relatives
import type { MagicLinkToken } from '../../domain/entities/magic-link-token.entity';
import { AuthException } from '../../domain/exceptions/auth.exception';
import type { IMagicLinkTokenRepository } from '../../domain/repositories/magic-link-token.repository';
import type { ISessionRepository } from '../../domain/repositories/session.repository';
import type { AuthResponseDto, VerifyMagicLinkDto } from '../dtos';
import { TokenService } from '../services/token.service';

@Injectable()
export class VerifyMagicLinkUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.MAGIC_LINK_TOKEN)
    private readonly magicLinkTokenRepository: IMagicLinkTokenRepository,
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: ISessionRepository,
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
    private readonly tokenService: TokenService,
    private readonly config: TypedConfigService,
  ) { }

  async execute(
    dto: VerifyMagicLinkDto,
    email: string,
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<AuthResponseDto> {
    const { token } = dto;
    const normalizedEmail = email.toLowerCase().trim();

    // Find valid tokens for this email
    const validTokens = await this.magicLinkTokenRepository.findValidByEmail(normalizedEmail);

    if (validTokens.length === 0) {
      throw AuthException.invalidToken();
    }

    // Find matching token by comparing hashes
    let matchedToken: MagicLinkToken | null = null;
    for (const t of validTokens) {
      const isValid = await this.tokenService.compareToken(token, t.tokenHash);
      if (isValid) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      throw AuthException.invalidToken();
    }

    // Mark token as used
    await this.magicLinkTokenRepository.markAsUsed(matchedToken.id);

    // Find or create user
    let user: User | null = await this.userRepository.findByEmail(normalizedEmail);

    const isNewUser = !user;

    if (!user) {
      // Create new user with account
      const username = normalizedEmail.split('@')[0];
      const tag = Math.random().toString(36).substring(2, 6).toUpperCase();

      user = await this.userRepository.createWithAccount(
        { username, tag },
        { identifier: normalizedEmail, provider: 'EMAIL' },
      );

      this.logger.info('New user created via magic link', {
        userId: user.id,
        email: normalizedEmail,
      });
    }

    // Activate user if pending (first login)
    if (user.status === 'PENDING') {
      user = await this.userRepository.activate(user.id, normalizedEmail);

      this.logger.info('User activated via magic link', { userId: user.id });
    }

    // Delete existing session (single session policy)
    await this.sessionRepository.deleteByUserId(user.id);

    // Create new session
    const refreshToken = this.tokenService.generateRandomToken();
    const refreshTokenHash = await this.tokenService.hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.tokenService.getRefreshTokenExpiresInMs());

    const session = await this.sessionRepository.create({
      userId: user.id,
      refreshTokenHash,
      expiresAt: refreshExpiresAt,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: normalizedEmail,
      role: user.role,
      type: 'access',
    });

    const refreshTokenJwt = this.tokenService.generateRefreshToken({
      sub: user.id,
      sid: session.id,
      type: 'refresh',
    });

    // Set cookies
    const isSecure = this.config.auth.cookieSecure;

    response.cookie('access', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: this.tokenService.getAccessTokenExpiresInMs(),
    });

    response.cookie('refresh', refreshTokenJwt, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: this.tokenService.getRefreshTokenExpiresInMs(),
    });

    this.logger.info('User logged in via magic link', { userId: user.id, isNewUser });
    this.logger.audit('LOGIN', user.id, 'Session', { method: 'magic_link' });

    return {
      user: {
        id: user.id,
        email: normalizedEmail,
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
