export interface SessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export class Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;

  constructor(props: SessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.refreshTokenHash = props.refreshTokenHash;
    this.userAgent = props.userAgent;
    this.ipAddress = props.ipAddress;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
