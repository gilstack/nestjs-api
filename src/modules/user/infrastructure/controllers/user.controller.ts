import { Controller, Get, Inject, NotFoundException, UseGuards } from '@nestjs/common';

// internal
import { CurrentUser } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import type { RequestUser } from '@modules/auth/infrastructure/strategies/jwt-cookie.strategy';
import { REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';

// relatives
import type { IUserRepository } from '../../domain/repositories/user.repository';

@Controller('user')
export class UserController {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
  ) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: RequestUser) {
    const foundUser = await this.userRepository.findById(user.userId);
    if (!foundUser) {
      throw new NotFoundException('User not found or inactive');
    }
    return foundUser;
  }
}
