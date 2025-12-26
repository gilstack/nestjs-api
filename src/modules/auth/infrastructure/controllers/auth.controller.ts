import { Body, Controller, HttpCode, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// internal
import { AuthRateLimit } from '@shared/infrastructure/throttler/decorators/rate-limit.decorator';
import type { FastifyReply, FastifyRequest } from 'fastify';

// relatives
import { AuthResponseDto, RequestMagicLinkDto, VerifyMagicLinkDto } from '../../application/dtos';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { RequestMagicLinkUseCase } from '../../application/use-cases/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from '../../application/use-cases/verify-magic-link.use-case';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import type { RequestUser } from '../strategies/jwt-cookie.strategy';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly requestMagicLinkUseCase: RequestMagicLinkUseCase,
    private readonly verifyMagicLinkUseCase: VerifyMagicLinkUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('magic-link')
  @Public()
  @AuthRateLimit()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a magic link',
    description:
      'Sends a magic link to the provided email for passwordless authentication. ' +
      'If the email is not registered, a new user account will be created automatically. ' +
      'The magic link expires in 15 minutes.',
  })
  @ApiBody({
    type: RequestMagicLinkDto,
    description: 'Email address for authentication',
    examples: {
      default: {
        summary: 'Standard email',
        value: { email: 'user@example.com' },
      },
      test: {
        summary: 'Test email',
        value: { email: 'test@storagie.com' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Magic link sent successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Se o email estiver cadastrado, você receberá um link de acesso.',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid email format.' })
  async requestMagicLink(@Body() dto: RequestMagicLinkDto): Promise<{ message: string }> {
    return this.requestMagicLinkUseCase.execute(dto);
  }

  @Post('magic-link/verify')
  @Public()
  @AuthRateLimit()
  @ApiOperation({
    summary: 'Verify magic link',
    description:
      'Verifies the magic link token and creates a user session. ' +
      'On success, sets HTTP-only cookies for access and refresh tokens. ' +
      'Returns the authenticated user information.',
  })
  @ApiBody({
    type: VerifyMagicLinkDto,
    description: 'Magic link token received via email',
    examples: {
      default: {
        summary: 'Token from magic link',
        value: { token: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2' },
      },
    },
  })
  @ApiQuery({
    name: 'email',
    description: 'Email address associated with the magic link',
    example: 'user@example.com',
    required: true,
  })
  @ApiOkResponse({
    description: 'Authentication successful, tokens issued via HTTP-only cookies.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token.' })
  @ApiBadRequestResponse({ description: 'Token or email format invalid.' })
  async verifyMagicLink(
    @Body() dto: VerifyMagicLinkDto,
    @Query('email') email: string,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<AuthResponseDto> {
    return this.verifyMagicLinkUseCase.execute(dto, email, request, response);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: 'Refresh session',
    description:
      'Uses the refresh token from HTTP-only cookie to issue new access and refresh tokens. ' +
      'The old refresh token is rotated for security. ' +
      'No request body needed - tokens are read from cookies.',
  })
  @ApiOkResponse({
    description: 'Session refreshed successfully. New tokens issued via cookies.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid, expired, or missing refresh token.' })
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<AuthResponseDto> {
    return this.refreshSessionUseCase.execute(request, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description:
      'Invalidates the current session and clears authentication cookies. ' +
      'Requires valid access token in Authorization header or cookie.',
  })
  @ApiNoContentResponse({ description: 'Logout successful. Cookies cleared.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated or session already expired.' })
  async logout(
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<void> {
    await this.logoutUseCase.execute(user.userId, response);
  }
}
