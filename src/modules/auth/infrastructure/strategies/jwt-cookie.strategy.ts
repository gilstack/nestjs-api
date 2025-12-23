import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { TypedConfigService } from '@config/config.service';
import type { FastifyRequest } from 'fastify';

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
                return cookies?.access_token || null;
            },
            ignoreExpiration: false,
            secretOrKey: config.auth.accessSecret,
        });
    }

    async validate(payload: JwtPayload): Promise<RequestUser> {
        if (!payload.sub) {
            throw new UnauthorizedException('Token inválido');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
