import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  type HealthCheckResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

// internal
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';

import { Public } from '@modules/auth/infrastructure/decorators/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('live')
  async liveness(): Promise<{ status: string }> {
    return { status: 'ok' };
  }
}
