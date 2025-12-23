import {
    Controller,
    Post,
    Body,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Res,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { RequestMagicLinkDto, VerifyMagicLinkDto, AuthResponseDto } from '../../application/dtos';
import { RequestMagicLinkUseCase } from '../../application/use-cases/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from '../../application/use-cases/verify-magic-link.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { RequestUser } from '../strategies/jwt-cookie.strategy';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly requestMagicLinkUseCase: RequestMagicLinkUseCase,
        private readonly verifyMagicLinkUseCase: VerifyMagicLinkUseCase,
        private readonly refreshSessionUseCase: RefreshSessionUseCase,
        private readonly logoutUseCase: LogoutUseCase,
    ) { }

    @Post('magic-link')
    @HttpCode(HttpStatus.OK)
    async requestMagicLink(
        @Body() dto: RequestMagicLinkDto,
    ): Promise<{ message: string }> {
        return this.requestMagicLinkUseCase.execute(dto);
    }

    @Post('magic-link/verify')
    async verifyMagicLink(
        @Body() dto: VerifyMagicLinkDto,
        @Query('email') email: string,
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<AuthResponseDto> {
        return this.verifyMagicLinkUseCase.execute(dto, email, request, response);
    }

    @Post('refresh')
    async refresh(
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<AuthResponseDto> {
        return this.refreshSessionUseCase.execute(request, response);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @CurrentUser() user: RequestUser,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<void> {
        await this.logoutUseCase.execute(user.userId, response);
    }

    @Post('me')
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser() user: RequestUser): Promise<RequestUser> {
        return user;
    }
}
