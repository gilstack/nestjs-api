import type { MagicLinkToken } from '../entities/magic-link-token.entity';

export interface IMagicLinkTokenRepository {
  create(email: string, tokenHash: string, expiresAt: Date): Promise<MagicLinkToken>;
  findValidByEmail(email: string): Promise<MagicLinkToken[]>;
  markAsUsed(id: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
