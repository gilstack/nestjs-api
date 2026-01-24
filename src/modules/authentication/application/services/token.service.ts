import { randomBytes } from 'node:crypto';

// internal
import { TypedConfigService } from '@config/config.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export type AppType = 'web' | 'dashboard';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  app: AppType;
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  app: AppType;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: TypedConfigService,
  ) {}

  generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  async compareToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  generateAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.config.auth.accessSecret,
      expiresIn: Math.floor(this.getAccessTokenExpiresInMs() / 1000),
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.config.auth.refreshSecret,
      expiresIn: Math.floor(this.getRefreshTokenExpiresInMs() / 1000),
    });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwtService.verify(token, {
      secret: this.config.auth.refreshSecret,
    });
  }

  getAccessTokenExpiresInMs(): number {
    return this.config.auth.accessExpiresIn * 60 * 1000;
  }

  getRefreshTokenExpiresInMs(): number {
    return this.config.auth.refreshExpiresIn * 24 * 60 * 60 * 1000;
  }
}
