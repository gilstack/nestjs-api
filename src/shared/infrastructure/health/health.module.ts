import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

// relatives
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule { }
