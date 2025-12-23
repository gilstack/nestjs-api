import appConfig from './configs/app.config';
import databaseConfig from './configs/database.config';
import cacheConfig from './configs/cache.config';
import queueConfig from './configs/queue.config';
import loggingConfig from './configs/logging.config';

export * from './configs/app.config';
export * from './configs/database.config';
export * from './configs/cache.config';
export * from './configs/queue.config';
export * from './configs/logging.config';

export const configs = [
    appConfig,
    databaseConfig,
    cacheConfig,
    queueConfig,
    loggingConfig,
];
