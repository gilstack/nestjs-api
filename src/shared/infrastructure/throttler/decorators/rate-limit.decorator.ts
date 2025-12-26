import { SkipThrottle, Throttle } from '@nestjs/throttler';

/**
 * Skip rate limiting for this route or controller
 */
export const NoRateLimit = () => SkipThrottle();

/**
 * Apply strict rate limiting (3 requests per second)
 * Use for sensitive operations like login, password reset, etc.
 */
export const StrictRateLimit = () => Throttle({ short: { limit: 3, ttl: 1000 } });

/**
 * Apply auth-specific rate limiting (5 requests per minute)
 * Use for authentication endpoints to prevent brute force attacks
 */
export const AuthRateLimit = () =>
  Throttle({
    short: { limit: 3, ttl: 1000 },
    medium: { limit: 5, ttl: 60000 },
  });

/**
 * Apply relaxed rate limiting (50 requests per 10 seconds)
 * Use for read-heavy endpoints
 */
export const RelaxedRateLimit = () => Throttle({ medium: { limit: 50, ttl: 10000 } });

/**
 * Custom rate limit with specific values
 * @param limit - Maximum number of requests
 * @param ttl - Time window in milliseconds
 */
export const CustomRateLimit = (limit: number, ttl: number) => Throttle({ short: { limit, ttl } });
