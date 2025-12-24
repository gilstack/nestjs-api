import { randomBytes } from 'node:crypto';
import type { TypedConfigService } from '@config/config.service';
import { Injectable } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
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

  generateAccessToken(payload: AccessTokenPayload & { type: string }): string {
    return this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.config.auth.accessSecret,
        expiresIn: Math.floor(this.getAccessTokenExpiresInMs() / 1000),
      },
    );
  }

  generateRefreshToken(payload: RefreshTokenPayload & { type: string }): string {
    return this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.config.auth.refreshSecret,
        expiresIn: Math.floor(this.getRefreshTokenExpiresInMs() / 1000),
      },
    );
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
