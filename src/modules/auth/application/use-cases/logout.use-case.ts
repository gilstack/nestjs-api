import type { TypedConfigService } from '@config/config.service';
import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_SERVICE, REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { FastifyReply } from 'fastify';
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
    // Delete session from database
    await this.sessionRepository.deleteByUserId(userId);

    // Clear cookies
    response.clearCookie('access', { path: '/' });
    response.clearCookie('refresh', { path: '/api/auth/refresh' });

    this.logger.info('User logged out', { userId });
    this.logger.audit('LOGOUT', userId, 'Session', {});
  }
}
