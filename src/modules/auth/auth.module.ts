import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// internal
import { REPOSITORY_TOKENS } from '@shared/constants/injection-tokens';

// relatives
import { UserModule } from '../user/user.module';
import { TokenService } from './application/services/token.service';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { RequestMagicLinkUseCase } from './application/use-cases/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from './application/use-cases/verify-magic-link.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PrismaMagicLinkTokenRepository } from './infrastructure/repositories/prisma-magic-link-token.repository';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository';
import { JwtCookieStrategy } from './infrastructure/strategies/jwt-cookie.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    // Services
    TokenService,

    // Use Cases
    RequestMagicLinkUseCase,
    VerifyMagicLinkUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,

    // Strategy
    JwtCookieStrategy,

    // Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtAuthGuard,

    // Repositories
    {
      provide: REPOSITORY_TOKENS.MAGIC_LINK_TOKEN,
      useClass: PrismaMagicLinkTokenRepository,
    },
    {
      provide: REPOSITORY_TOKENS.SESSION,
      useClass: PrismaSessionRepository,
    },
  ],
  exports: [JwtAuthGuard, TokenService],
})
export class AuthModule { }
