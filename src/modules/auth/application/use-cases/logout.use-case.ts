import { Inject, Injectable } from '@nestjs/common';

// internal
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
  ) { }

  async execute(userId: string, response: FastifyReply): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId);

    response.clearCookie('access', { path: '/' });
    response.clearCookie('refresh', { path: '/api/auth/refresh' });

    this.logger.info('User logged out', { userId });
    this.logger.audit('LOGOUT', userId, 'Session', {});
  }
}

