import { Inject, Injectable } from '@nestjs/common';

// internal
import { TypedConfigService } from '@config/config.service';
import { LOGGER_SERVICE, REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { FastifyReply } from 'fastify';

// relatives
import type { ISessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: ISessionRepository,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
    private readonly config: TypedConfigService,
  ) {}

  async execute(userId: string, response: FastifyReply): Promise<void> {
    // Expire all sessions for this user (web + dashboard)
    await this.sessionRepository.expireAllByUserId(userId);

    const cookieDomain = this.config.auth.cookieDomain;

    // Clear cookies
    response.clearCookie('access', {
      path: '/',
      ...(cookieDomain && { domain: cookieDomain }),
    });

    response.clearCookie('refresh', {
      path: '/',
      ...(cookieDomain && { domain: cookieDomain }),
    });

    this.logger.info('User logged out', { userId });
    this.logger.audit('LOGOUT', userId, 'Session', {});
  }
}
