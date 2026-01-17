import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';

// internal
import { REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';

// relatives
import { GetCurrentUserUseCase } from './application/use-cases';
import { UserController } from './infrastructure/controllers/user.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [AuthorizationModule],
  controllers: [UserController],
  providers: [
    GetCurrentUserUseCase,
    {
      provide: REPOSITORY_TOKENS.USER,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [REPOSITORY_TOKENS.USER],
})
export class UserModule {}
