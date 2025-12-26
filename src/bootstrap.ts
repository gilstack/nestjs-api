import { join } from 'node:path';
import fastifyCookie from '@fastify/cookie';
import {
  ClassSerializerInterceptor,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

// internal
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import { HttpExceptionFilter, ResponseInterceptor } from '@shared/infrastructure/http/index';
import type { ILogger } from '@shared/infrastructure/logging/interfaces/logger.interface';

export const bootstrap = async (app: NestFastifyApplication): Promise<void> => {
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  const logger = await app.resolve<ILogger>(LOGGER_SERVICE);

  const appConfig = configService.get('app', { infer: true })!;

  // API Prefix
  app.setGlobalPrefix(appConfig.prefix, {
    exclude: ['/'],
  });

  // Cross Origin Resource Sharing
  app.enableCors({
    origin: [appConfig.adminUrl, appConfig.frontendUrl],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  // Cookie Parser
  await app.register(fastifyCookie);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Global Interceptors
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(reflector, {
      excludeExtraneousValues: false,
    }),
  );

  // Static Assets
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
  });

  // Listening the application
  await app.listen(appConfig.port, '0.0.0.0');
  console.log(`Server running on ${await app.getUrl()}`);
};
