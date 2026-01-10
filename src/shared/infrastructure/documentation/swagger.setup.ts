import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ConfigService } from '@nestjs/config';

export const setupSwagger = (app: NestFastifyApplication): void => {
  const configService = app.get(ConfigService);
  const appConfig = configService.get('app', { infer: true })!

  const config = new DocumentBuilder()
    .setTitle('Storagie API')
    .setDescription('The Storagie API description')
    .setVersion('1.0')
    .addServer(`http://localhost:${appConfig.port}`, 'Development')
    .addTag('storagie')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/docs/json',
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  app.use(
    '/reference',
    apiReference({
      theme: 'purple',
      content: document,
      withFastify: true,
    }),
  );
};
