import 'reflect-metadata';
import { validateEnv } from '@config/env.validation';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { startupLogger } from '@shared/infrastructure/logging/startup-logger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { bootstrap } from './bootstrap';

const main = async () => {
  startupLogger.info('Validating environment variables...');

  try {
    validateEnv(process.env);
    startupLogger.info('Environment validation passed');
  } catch (error) {
    startupLogger.fatal({ error: (error as Error).message }, 'Environment validation failed');
    process.exit(1);
  }

  startupLogger.info('Starting NestJS application...');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));

  await bootstrap(app);
};

main();
