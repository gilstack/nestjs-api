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

  async execute(dto: RequestMagicLinkDto): Promise<{ message: string }> {
    const { email } = dto;
    const normalizedEmail = email.toLowerCase().trim();

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
    const magicLinkUrl = `${this.config.auth.magicLinkUrl}?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Queue email for async sending
    await this.queueService.add(QUEUE_NAMES.EMAIL, JOB_NAMES.MAGIC_LINK, {
      email: normalizedEmail,
      userName,
      magicLinkUrl,
      expiresInMinutes: Math.floor(expiresInSeconds / 60),
    });

    this.logger.info('Magic link requested', { email: normalizedEmail });
    this.logger.audit('MAGIC_LINK_REQUEST', 'system', 'MagicLinkToken', { email: normalizedEmail });

    return { message: 'Se o email estiver cadastrado, você receberá um link de acesso.' };
  }
}
