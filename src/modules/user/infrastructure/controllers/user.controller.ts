import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// internal
import { CurrentUser } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '@modules/auth/infrastructure/strategies/jwt-cookie.strategy';

// relatives
import { UserResponseDto } from '../../application/dtos/user.response.dto';
import { GetCurrentUserUseCase } from '../../application/use-cases';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  async me(@CurrentUser() user: RequestUser): Promise<UserResponseDto> {
    return this.getCurrentUserUseCase.execute(user.userId);
  }
}
