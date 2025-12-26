import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export const setupSwagger = (app: NestFastifyApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Storagie API')
    .setDescription('The Storagie API description')
    .setVersion('1.0')
    .addTag('storagie')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      withFastify: true,
      spec: {
        content: document,
      },
    } as Parameters<typeof apiReference>[0]),
  );
};
