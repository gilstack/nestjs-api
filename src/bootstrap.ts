import type { NestFastifyApplication } from '@nestjs/platform-fastify'

import {
    ClassSerializerInterceptor,
    UnprocessableEntityException,
    ValidationPipe
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { join } from 'node:path'

// filters
// import { DomainExceptionFilter } from '@shared/filters'

// swagger
// import { document } from '@core/swagger'

export const bootstrap = async (app: NestFastifyApplication): Promise<void> => {
    const reflector = app.get(Reflector)
    const configService = app.get(ConfigService)

    const appConfig = configService.get('app', { infer: true })!

    // API Prefix
    app.setGlobalPrefix(appConfig.prefix, {
        exclude: ['/']
    })

    // Cross Origin Resource Sharing
    app.enableCors({
        origin: [appConfig.adminUrl, appConfig.frontendUrl],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true
    })

    // Global Validation Pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true
            },
            errorHttpStatusCode: 422,
            exceptionFactory: (errors) => new UnprocessableEntityException(errors)
        })
    )

    // Global Filters
    // app.useGlobalFilters(new DomainExceptionFilter())

    // Global Interceptors
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(reflector, {
            excludeExtraneousValues: false
        })
    )

    // Static Assets
    app.useStaticAssets({
        root: join(__dirname, '..', 'public')
    })

    // API Documentation
    // document(app)

    // Listening the application
    await app.listen(appConfig.port)
    console.log(`Server running on ${await app.getUrl()}`)
}