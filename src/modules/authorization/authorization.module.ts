import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AbilityFactory } from './application/factories';
import { PoliciesGuard } from './infrastructure/guards/policies.guard';

@Global()
@Module({
  providers: [
    AbilityFactory,
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
  ],
  exports: [AbilityFactory],
})
export class AuthorizationModule {}
