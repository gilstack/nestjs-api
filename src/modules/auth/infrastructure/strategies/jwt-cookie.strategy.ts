// internal
import { TypedConfigService } from '@config/config.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { FastifyRequest } from 'fastify';
import { Strategy } from 'passport-jwt';

// relatives
import { AuthException } from '../../domain/exceptions/auth.exception';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: TypedConfigService) {
    super({
      jwtFromRequest: (req: FastifyRequest) => {
        const cookies = req.cookies as Record<string, string> | undefined;
        return cookies?.access || null;
      },
      ignoreExpiration: false,
      secretOrKey: config.auth.accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (!payload.sub) {
      throw AuthException.invalidToken();
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
