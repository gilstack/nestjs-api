// Injection Tokens - Centralized DI symbols

// Database
export const DATABASE_SERVICE = Symbol('DATABASE_SERVICE');

// Cache
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

// Queue
export const QUEUE_SERVICE = Symbol('QUEUE_SERVICE');

// Logger
export const LOGGER_SERVICE = Symbol('LOGGER_SERVICE');

// Email
export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

// Repositories
export const REPOSITORY_TOKENS = {
    USER: Symbol('USER_REPOSITORY'),
    MAGIC_LINK_TOKEN: Symbol('MAGIC_LINK_TOKEN_REPOSITORY'),
    SESSION: Symbol('SESSION_REPOSITORY'),
} as const;

// Services
export const SERVICE_TOKENS = {
    USER: Symbol('USER_SERVICE'),
} as const;

