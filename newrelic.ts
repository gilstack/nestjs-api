/**
 * New Relic Agent Configuration
 *
 * This file is automatically detected by the New Relic agent.
 * All values are sourced from environment variables for flexibility.
 *
 * @see https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration/
 */

import type { NewRelicConfig } from './src/config/configs/newrelic.config';

interface NewRelicAgentConfig {
  app_name: string[];
  license_key: string;
  agent_enabled: boolean;
  distributed_tracing: { enabled: boolean };
  logging: { level: string; filepath: string };
  allow_all_headers: boolean;
  attributes: { exclude: string[] };
  transaction_tracer: { enabled: boolean; record_sql: string };
  error_collector: { enabled: boolean; ignore_status_codes: number[] };
  slow_sql: { enabled: boolean; max_samples: number };
}

const config: NewRelicAgentConfig = {
  /**
   * Application name(s) as an array.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Storagie API'],

  /**
   * License key from New Relic account.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',

  /**
   * Enable/disable the agent.
   * By default, disabled in development to avoid noise.
   */
  agent_enabled: process.env.NEW_RELIC_ENABLED === 'true',

  /**
   * Distributed tracing enables linking of transactions across services.
   */
  distributed_tracing: {
    enabled: process.env.NEW_RELIC_DISTRIBUTED_TRACING_ENABLED !== 'false',
  },

  /**
   * Logging configuration for the agent itself.
   */
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'stdout',
  },

  /**
   * Allow all custom headers to be captured.
   */
  allow_all_headers: true,

  /**
   * Attributes configuration for security.
   * Exclude sensitive headers and body fields.
   */
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.x-api-key',
      'request.body.password',
      'request.body.token',
      'request.body.secret',
      'request.body.refreshToken',
    ],
  },

  /**
   * Transaction tracer settings.
   */
  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated',
  },

  /**
   * Error collector settings.
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [400, 401, 403, 404, 422],
  },

  /**
   * Slow SQL tracking.
   */
  slow_sql: {
    enabled: true,
    max_samples: 10,
  },
};

module.exports = { config };
