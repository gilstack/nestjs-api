// internal
import { TypedConfigService } from '@config/config.service';
import { UserRole } from '@modules/user/domain/enums/user-role.enum';
import { UserStatus } from '@modules/user/domain/enums/user-status.enum';
import type { IUserRepository } from '@modules/user/domain/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_SERVICE, REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { FastifyReply, FastifyRequest } from 'fastify';

// relatives
import type { MagicLinkToken } from '../../domain/entities/magic-link-token.entity';
import { SessionSource } from '../../domain/enums/session-source.enum';
import { AuthException } from '../../domain/exceptions/auth.exception';
import type { IMagicLinkTokenRepository } from '../../domain/repositories/magic-link-token.repository';
import type { ISessionRepository } from '../../domain/repositories/session.repository';
import type { AuthResponseDto, VerifyMagicLinkDto } from '../dtos';
import { TokenService } from '../services/token.service';

const ALLOWED_DOMAIN = '@storagie.com';
const ALLOWED_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER];

@Injectable()
export class VerifyAdminUseCase {
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
  ) {}

  async execute(
    dto: VerifyMagicLinkDto,
    email: string,
    request: FastifyRequest,
    response: FastifyReply,
  ): Promise<AuthResponseDto> {
    const { token } = dto;
    const normalizedEmail = email.toLowerCase().trim();

    // Validate domain
    if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
      this.logger.warn('Admin login attempt with invalid domain', { email: normalizedEmail });
      throw AuthException.invalidDomain();
    }

    // Find valid tokens for this email
    const validTokens = await this.magicLinkTokenRepository.findValidByEmail(normalizedEmail);

    let matchedToken: MagicLinkToken | null = null;

    // Check valid tokens
    for (const t of validTokens) {
      if (await this.tokenService.compareToken(token, t.tokenHash)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      throw AuthException.invalidToken();
    }

    // Mark token as used
    try {
      await this.magicLinkTokenRepository.markAsUsed(matchedToken.id);
    } catch (error) {
      this.logger.warn('Failed to mark token as used', { tokenId: matchedToken.id, error });
    }

    // Find user - admin does NOT create new users
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      this.logger.warn('Admin login attempt for non-existent user', { email: normalizedEmail });
      throw AuthException.userNotFound();
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(user.role as UserRole)) {
      this.logger.warn('Admin login attempt with insufficient permissions', {
        email: normalizedEmail,
        role: user.role,
      });
      throw AuthException.insufficientPermissions();
    }

    // Validate user status
    if (user.status !== UserStatus.ACTIVE) {
      throw AuthException.userInactive();
    }

    // Delete existing DASHBOARD session (single session per app policy)
    await this.sessionRepository.deleteByUserIdAndSource(user.id, SessionSource.DASHBOARD);

    // Create new session
    const refreshToken = this.tokenService.generateRandomToken();
    const refreshTokenHash = await this.tokenService.hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.tokenService.getRefreshTokenExpiresInMs());

    const session = await this.sessionRepository.create({
      userId: user.id,
      source: SessionSource.DASHBOARD,
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
      app: 'dashboard',
    });

    const refreshTokenJwt = this.tokenService.generateRefreshToken({
      sub: user.id,
      sid: session.id,
      app: 'dashboard',
    });

    // Set cookies
    const isSecure = this.config.auth.cookieSecure;
    const cookieDomain = this.config.auth.cookieDomain;

    response.cookie('access', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      ...(cookieDomain && { domain: cookieDomain }),
      maxAge: this.tokenService.getAccessTokenExpiresInMs(),
    });

    response.cookie('refresh', refreshTokenJwt, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      ...(cookieDomain && { domain: cookieDomain }),
      maxAge: this.tokenService.getRefreshTokenExpiresInMs(),
    });

    this.logger.info('Admin user logged in via magic link', { userId: user.id, role: user.role });
    this.logger.audit('LOGIN', user.id, 'Session', { method: 'magic_link', source: 'dashboard' });

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
