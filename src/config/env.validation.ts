import { IsString, IsNumber, IsEnum, IsOptional, validateSync } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

export class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment = Environment.Development;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    PORT: number = 3000;

    @IsString()
    API_PREFIX: string = 'api';

    @IsString()
    @IsOptional()
    ADMIN_URL?: string;

    @IsString()
    @IsOptional()
    FRONTEND_URL?: string;

    @IsString()
    DATABASE_URL: string;

    @IsString()
    @IsOptional()
    REDIS_HOST?: string;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsOptional()
    REDIS_PORT?: number;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        const errorMessages = errors
            .map((err) => Object.values(err.constraints || {}).join(', '))
            .join('\n');

        throw new Error(`Environment validation failed:\n${errorMessages}`);
    }

    return validatedConfig;
}
