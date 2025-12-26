// internal
import { CurrentUser } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import type { RequestUser } from '@modules/auth/infrastructure/strategies/jwt-cookie.strategy';
import { Controller, Get, Inject, NotFoundException, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';

// relatives
import type { IUserRepository } from '../../domain/repositories/user.repository';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the complete profile of the currently authenticated user. ' +
      'Requires a valid access token in the Authorization header or HTTP-only cookie.',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
        username: { type: 'string', example: 'johndoe' },
        tag: { type: 'string', example: '1234' },
        name: { type: 'string', example: 'John Doe', nullable: true },
        image: {
          type: 'string',
          example: 'https://example.com/avatars/johndoe.jpg',
          nullable: true,
        },
        bio: {
          type: 'string',
          example: 'Software developer passionate about building great products.',
          nullable: true,
        },
        role: { type: 'string', enum: ['GUEST', 'USER', 'MANAGER', 'ADMIN'], example: 'USER' },
        status: {
          type: 'string',
          enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'DELETED', 'SUSPENDED', 'BANNED'],
          example: 'ACTIVE',
        },
        verifiedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-26T15:30:00.000Z',
          nullable: true,
        },
        createdAt: { type: 'string', format: 'date-time', example: '2025-12-25T10:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-12-26T15:30:00.000Z' },
        accounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              identifier: { type: 'string', example: 'user@example.com' },
              provider: { type: 'string', enum: ['EMAIL', 'GOOGLE', 'GITHUB'], example: 'EMAIL' },
              verifiedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-26T15:30:00.000Z',
                nullable: true,
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated. Access token is missing or invalid.',
  })
  @ApiNotFoundResponse({ description: 'User not found or account is inactive/deleted.' })
  async me(@CurrentUser() user: RequestUser) {
    const foundUser = await this.userRepository.findById(user.userId);
    if (!foundUser) {
      throw new NotFoundException('User not found or inactive');
    }
    return foundUser;
  }
}
