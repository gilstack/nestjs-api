import type { SessionSource } from '../enums/session-source.enum';
import type { Session } from '../entities/session.entity';

export interface CreateSessionData {
  userId: string;
  source: SessionSource;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByUserIdAndSource(userId: string, source: SessionSource): Promise<Session | null>;
  update(id: string, data: Partial<Omit<CreateSessionData, 'source'>>): Promise<Session>;
  delete(id: string): Promise<void>;
  deleteByUserIdAndSource(userId: string, source: SessionSource): Promise<void>;
  expireByUserIdAndSource(userId: string, source: SessionSource): Promise<void>;
  expireAllByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}

