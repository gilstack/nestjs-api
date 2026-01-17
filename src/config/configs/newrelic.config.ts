import { registerAs } from '@nestjs/config';

export interface NewRelicConfig {
  enabled: boolean;
  appName: string;
  licenseKey: string;
  distributedTracingEnabled: boolean;
  logLevel: string;
}

export default registerAs<NewRelicConfig>(
  'newrelic',
  (): NewRelicConfig => ({
    enabled: process.env.NEW_RELIC_ENABLED === 'true',
    appName: process.env.NEW_RELIC_APP_NAME || 'Storagie API',
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY || '',
    distributedTracingEnabled: process.env.NEW_RELIC_DISTRIBUTED_TRACING_ENABLED !== 'false',
    logLevel: process.env.NEW_RELIC_LOG_LEVEL || 'info',
  }),
);
