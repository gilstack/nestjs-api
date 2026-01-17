
import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';

// internal
import { Public } from '@modules/authentication/infrastructure/decorators/public.decorator';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Comprehensive health check',
    description:
      'Performs a comprehensive health check including database connectivity. ' +
      'Use this endpoint for monitoring and alerting systems.',
  })
  @ApiOkResponse({
    description: 'Service is healthy. All dependencies are operational.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: { status: { type: 'string', example: 'up' } },
            },
          },
        },
        error: { type: 'object', example: {} },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: { status: { type: 'string', example: 'up' } },
            },
          },
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Service is unhealthy. One or more dependencies are down.',
  })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        const isHealthy = await this.prisma.healthCheck();
        return { database: { status: isHealthy ? 'up' : 'down' } };
      },
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness check',
    description:
      'Checks if the service is ready to accept traffic. ' +
      'Used by Kubernetes readiness probes to determine if the pod should receive traffic.',
  })
  @ApiOkResponse({
    description: 'Service is ready to accept requests.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: { status: { type: 'string', example: 'up' } },
            },
          },
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({ description: 'Service is not ready to accept traffic.' })
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        const isHealthy = await this.prisma.healthCheck();
        return { database: { status: isHealthy ? 'up' : 'down' } };
      },
    ]);
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness check',
    description:
      'Simple liveness probe for container orchestration. ' +
      'Used by Kubernetes liveness probes to determine if the pod should be restarted.',
  })
  @ApiOkResponse({
    description: 'Service is alive and running.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  async liveness(): Promise<{ status: string }> {
    return { status: 'ok' };
  }
}
