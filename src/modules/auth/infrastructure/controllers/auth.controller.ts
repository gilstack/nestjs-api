import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

// internal
import { AuthRateLimit } from '@shared/infrastructure/throttler/decorators/rate-limit.decorator';

// relatives
import {
  AuthResponseDto,
  RequestMagicLinkDto,
  VerifyMagicLinkDto,
} from '../../application/dtos';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { RequestMagicLinkUseCase } from '../../application/use-cases/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from '../../application/use-cases/verify-magic-link.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
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
  @AuthRateLimit()
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body() dto: RequestMagicLinkDto): Promise<{ message: string }> {
    return this.requestMagicLinkUseCase.execute(dto);
  }

  @Post('magic-link/verify')
  @AuthRateLimit()
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
}
