import { TypedConfigService } from '@config/config.service';
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Generated Prisma Client
import { PrismaClient } from './generated/client.js';

// Relatives
import type { IDatabaseService } from '../interfaces/database.interface';
import { softDeleteExtension } from './extensions/soft-delete.extension';

export type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

function createExtendedClient(baseClient: PrismaClient) {
  return baseClient.$extends(softDeleteExtension);
}

@Injectable()
export class PrismaService implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  private readonly client: ExtendedPrismaClient;
  private readonly pool: pg.Pool;

  constructor(private readonly config: TypedConfigService) {
    this.pool = new pg.Pool({
      connectionString: config.database.url,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : undefined,
    });

    const adapter = new PrismaPg(this.pool);

    const baseClient = new PrismaClient({
      adapter,
      log: config.database.logging ? ['query', 'error', 'warn'] : ['error'],
    });

    this.client = createExtendedClient(baseClient);
  }

  /**
   * Get the extended Prisma client with soft delete support
   */
  get db(): ExtendedPrismaClient {
    return this.client;
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    await this.client.$connect();
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
    await this.pool.end();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
