// internal
import { TypedConfigService } from '@config/config.service';
import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '@modules/user/domain/repositories/user.repository';
import {
  LOGGER_SERVICE,
  QUEUE_SERVICE,
  REPOSITORY_TOKENS,
} from '@shared/constants/injection-tokens';
import { JOB_NAMES, QUEUE_NAMES } from '@shared/constants/queue.constants';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import type { IQueueService } from '@shared/infrastructure/queue/interfaces/queue.interface';

// relatives
import type { IMagicLinkTokenRepository } from '../../domain/repositories/magic-link-token.repository';
import type { RequestMagicLinkDto } from '../dtos';
import { TokenService } from '../services/token.service';
import { UserRole } from '@modules/user/domain/enums';

@Injectable()
export class RequestMagicLinkUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.MAGIC_LINK_TOKEN)
    private readonly magicLinkTokenRepository: IMagicLinkTokenRepository,
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(QUEUE_SERVICE) private readonly queueService: IQueueService,
    @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
    private readonly tokenService: TokenService,
    private readonly config: TypedConfigService,
  ) {}

  async execute(dto: RequestMagicLinkDto): Promise<{ message: string; remaining?: number }> {
    const { email } = dto;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing valid tokens associated with the email
    const validTokens = await this.magicLinkTokenRepository.findValidByEmail(normalizedEmail);

    if (validTokens.length > 0) {
      const activeToken = validTokens[0];
      const now = Date.now();
      const expiresAt = activeToken.expiresAt.getTime();
      const diff = expiresAt - now;

      if (diff > 0) {
        const remaining = Math.ceil(diff / 1000);
        return {
          message: `Magic link sent successfully.`,
          remaining,
        };
      }
    }

    // Try to find existing user to get their name
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    const userName = existingUser?.name || null;

    // Generate random token and hash
    const token = this.tokenService.generateRandomToken();
    const tokenHash = await this.tokenService.hashToken(token);

    // Calculate expiration
    const expiresInSeconds = this.config.auth.magicLinkExpiresIn;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // Save token hash to database
    await this.magicLinkTokenRepository.create(normalizedEmail, tokenHash, expiresAt);

    // Build magic link URL
    const baseUrl =
      existingUser?.role === UserRole.ADMIN
        ? this.config.app.admin + this.config.auth.magicLinkCallbackPath
        : this.config.app.frontend + this.config.auth.magicLinkCallbackPath;

    const magicLinkUrl = `${baseUrl}?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Queue email for async sending
    await this.queueService.add(QUEUE_NAMES.EMAIL, JOB_NAMES.MAGIC_LINK, {
      email: normalizedEmail,
      userName,
      magicLinkUrl,
      expiresInMinutes: Math.floor(expiresInSeconds / 60),
    });

    this.logger.info('Magic link requested', { email: normalizedEmail });
    this.logger.audit('MAGIC_LINK_REQUEST', 'system', 'MagicLinkToken', { email: normalizedEmail });

    return { message: 'Magic link sent successfully.' };
  }
}
