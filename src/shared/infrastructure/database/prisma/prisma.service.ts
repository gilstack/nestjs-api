import { TypedConfigService } from '@config/config.service';
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// relatives
import type { IDatabaseService } from '../interfaces/database.interface';
import { softDeleteExtension } from './extensions/soft-delete.extension';

const basePrisma = new PrismaClient();
const extendedPrisma = basePrisma.$extends(softDeleteExtension);

export type ExtendedPrismaClient = typeof extendedPrisma;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements IDatabaseService, OnModuleInit, OnModuleDestroy
{
  private readonly extended: ExtendedPrismaClient;

  constructor(config: TypedConfigService) {
    super({
      log: config.database.logging ? ['query', 'error', 'warn'] : ['error'],
    });

    this.extended = this.$extends(softDeleteExtension);
  }

  /**
   * Get the extended Prisma client with soft delete support
   */
  get withSoftDelete(): ExtendedPrismaClient {
    return this.extended;
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
