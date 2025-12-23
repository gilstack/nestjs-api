import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { IncomingMessage } from 'http';
import { LOGGER_SERVICE } from '@shared/constants/injection-tokens';
import { PinoLoggerService } from './pino/pino-logger.service';
import { TypedConfigService } from '@config/config.service';

@Global()
@Module({
    imports: [
        PinoLoggerModule.forRootAsync({
            inject: [TypedConfigService],
            useFactory: (config: TypedConfigService) => {
                const isDev = config.app.env !== 'production';

                return {
                    pinoHttp: {
                        level: config.logging.level,

                        // pino-pretty apenas em desenvolvimento
                        transport: isDev
                            ? {
                                target: 'pino-pretty',
                                options: {
                                    colorize: true,
                                    levelFirst: true,
                                    translateTime: 'HH:MM:ss.l',
                                    ignore: 'pid,hostname',
                                    singleLine: false,
                                    messageFormat: '{msg}',
                                },
                            }
                            : undefined,

                        // Formatters para produção (JSON estruturado)
                        formatters: {
                            level: (label: string) => ({ level: label }),
                        },

                        // Redact dados sensíveis
                        redact: {
                            paths: [
                                'req.headers.authorization',
                                'req.headers.cookie',
                                'req.body.password',
                                'req.body.token',
                                'req.body.secret',
                            ],
                            remove: true,
                        },

                        // Serializers customizados
                        serializers: {
                            req: (req) => ({
                                method: req.method,
                                url: req.url,
                                query: req.query,
                            }),
                            res: (res) => ({
                                statusCode: res.statusCode,
                            }),
                        },

                        // Ignorar health checks
                        autoLogging: {
                            ignore: (req: IncomingMessage) =>
                                req.url === '/health' || req.url === '/metrics' || req.url === '/favicon.ico',
                        },
                    },
                };
            },
        }),
    ],
    providers: [
        {
            provide: LOGGER_SERVICE,
            useClass: PinoLoggerService,
        },
    ],
    exports: [LOGGER_SERVICE, PinoLoggerModule],
})
export class LoggingModule { }
