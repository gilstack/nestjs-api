import appConfig from './configs/app.config';
import authConfig from './configs/auth.config';
import cacheConfig from './configs/cache.config';
import databaseConfig from './configs/database.config';
import emailConfig from './configs/email.config';
import loggingConfig from './configs/logging.config';
import newrelicConfig from './configs/newrelic.config';
import queueConfig from './configs/queue.config';

export * from './configs/app.config';
export * from './configs/auth.config';
export * from './configs/cache.config';
export * from './configs/database.config';
export * from './configs/email.config';
export * from './configs/logging.config';
export * from './configs/newrelic.config';
export * from './configs/queue.config';

export const configs = [
  appConfig,
  databaseConfig,
  cacheConfig,
  queueConfig,
  loggingConfig,
  authConfig,
  emailConfig,
  newrelicConfig,
];
