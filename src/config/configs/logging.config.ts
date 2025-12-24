import { registerAs } from '@nestjs/config';

export interface LoggingConfig {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  prettyPrint: boolean;
  enablePerformanceLogging: boolean;
  enableQueryLogging: boolean;
}

export default registerAs(
  'logging',
  (): LoggingConfig => ({
    level: (process.env.LOG_LEVEL as LoggingConfig['level']) || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
    enablePerformanceLogging: process.env.ENABLE_PERF_LOGGING === 'true',
    enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
  }),
);
