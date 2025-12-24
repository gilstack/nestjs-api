import { Global, Module } from '@nestjs/common';
import { DATABASE_SERVICE } from '@shared/constants/injection-tokens';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_SERVICE,
      useClass: PrismaService,
    },
    PrismaService,
  ],
  exports: [DATABASE_SERVICE, PrismaService],
})
export class DatabaseModule {}
