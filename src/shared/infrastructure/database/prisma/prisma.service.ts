import type { TypedConfigService } from '@config/config.service';
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { IDatabaseService } from '../interfaces/database.interface';

@Injectable()
export class PrismaService implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor(private readonly config: TypedConfigService) {
    this.client = new PrismaClient({
      log: config.database.logging ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  get prisma(): PrismaClient {
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
