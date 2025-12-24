import type { Session } from '../entities/session.entity';

export interface CreateSessionData {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session | null>;
  update(id: string, data: Partial<CreateSessionData>): Promise<Session>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
