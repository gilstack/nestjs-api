import { TypedConfigService } from '@config/config.service';
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { IDatabaseService } from '../interfaces/database.interface';

@Injectable()
export class PrismaService extends PrismaClient implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  constructor(config: TypedConfigService) {
    super({
      log: config.database.logging ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    await this.$connect();
  }

  async disconnect(): Promise<void> {
    await this.$disconnect();
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

