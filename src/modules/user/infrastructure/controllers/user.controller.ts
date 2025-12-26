import { Controller, Get, UseGuards } from '@nestjs/common';

// internal
import { CurrentUser } from '@modules/auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '@modules/auth/infrastructure/guards/jwt-auth.guard';
import type { RequestUser } from '@modules/auth/infrastructure/strategies/jwt-cookie.strategy';

@Controller('user')
export class UserController {
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser() user: RequestUser): Promise<RequestUser> {
        return user;
    }
}
