import { Module } from '@nestjs/common';

// internal
import { REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';

// relatives
import { UserController } from './infrastructure/controllers/user.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: REPOSITORY_TOKENS.USER,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [REPOSITORY_TOKENS.USER],
})
export class UserModule {}
