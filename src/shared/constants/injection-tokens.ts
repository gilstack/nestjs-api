// Injection Tokens - Centralized DI symbols

// Database
export const DATABASE_SERVICE = Symbol('DATABASE_SERVICE');

// Cache
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

// Queue
export const QUEUE_SERVICE = Symbol('QUEUE_SERVICE');

// Logger
export const LOGGER_SERVICE = Symbol('LOGGER_SERVICE');

// Repositories
export const REPOSITORY_TOKENS = {
    USER: Symbol('USER_REPOSITORY'),
} as const;

// Services
export const SERVICE_TOKENS = {
    USER: Symbol('USER_SERVICE'),
} as const;
