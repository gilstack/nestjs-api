import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { REPOSITORY_TOKENS, LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import type { ISessionRepository } from '../../domain/repositories/session.repository';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';
import { TokenService } from '../services/token.service';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';
import type { AuthResponseDto } from '../dtos';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { TypedConfigService } from '@config/config.service';

@Injectable()
export class RefreshSessionUseCase {
    constructor(
        @Inject(REPOSITORY_TOKENS.SESSION)
        private readonly sessionRepository: ISessionRepository,
        @Inject(LOGGER_SERVICE) private readonly logger: ILogger,
        private readonly tokenService: TokenService,
        private readonly prisma: PrismaService,
        private readonly config: TypedConfigService,
    ) { }

    async execute(
        request: FastifyRequest,
        response: FastifyReply,
    ): Promise<AuthResponseDto> {
        // Get refresh token from cookie
        const refreshTokenJwt = (request.cookies as Record<string, string>)?.refresh_token;

        if (!refreshTokenJwt) {
            throw new UnauthorizedException('Refresh token não encontrado');
        }

        // Verify JWT
        let payload;
        try {
            payload = this.tokenService.verifyRefreshToken(refreshTokenJwt);
        } catch {
            throw new UnauthorizedException('Refresh token inválido');
        }

        // Find session
        const session = await this.sessionRepository.findById(payload.sid);

        if (!session || session.isExpired()) {
            throw new UnauthorizedException('Sessão expirada');
        }

        // Get user
        const user = await this.prisma.prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                accounts: {
                    where: { provider: 'EMAIL' },
                    take: 1,
                },
            },
        });

        if (!user || user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Usuário inativo');
        }

        const email = user.accounts[0]?.identifier || '';

        // Generate new access token
        const accessToken = this.tokenService.generateAccessToken({
            sub: user.id,
            email,
            role: user.role,
        });

        // Set new access token cookie
        const isSecure = this.config.auth.cookieSecure;

        response.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'strict',
            path: '/',
            maxAge: this.tokenService.getAccessTokenExpiresInMs(),
        });

        this.logger.info('Session refreshed', { userId: user.id });

        return {
            user: {
                id: user.id,
                email,
                username: user.username,
                tag: user.tag,
                name: user.name,
                image: user.image,
                role: user.role,
                status: user.status,
            },
        };
    }
}
