import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS, LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ISessionRepository } from '../../domain/repositories/session.repository';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { FastifyReply } from 'fastify';
import { TypedConfigService } from '@config/config.service';

@Injectable()
export class LogoutUseCase {
    constructor(
        @Inject(REPOSITORY_TOKENS.SESSION)
        private readonly sessionRepository: ISessionRepository,
        @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
        private readonly config: TypedConfigService,
    ) { }

    async execute(userId: string, response: FastifyReply): Promise<void> {
        // Delete session from database
        await this.sessionRepository.deleteByUserId(userId);

        // Clear cookies
        response.clearCookie('access_token', { path: '/' });
        response.clearCookie('refresh_token', { path: '/api/auth/refresh' });

        this.logger.info('User logged out', { userId });
        this.logger.audit('LOGOUT', userId, 'Session', {});
    }
}
