// Queue Constants
export const QUEUE_NAMES = {
  EMAIL: 'email',
} as const;


// Job Constants
export const JOB_NAMES = {
  MAGIC_LINK: 'magic-link',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
