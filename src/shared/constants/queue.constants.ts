// Queues
export const QUEUE_NAMES = {
  EMAIL: 'email',
  ANNOUNCEMENT: 'announcement',
} as const;

// Jobs
export const JOB_NAMES = {
  MAGIC_LINK: 'magic-link', // Email
  ACTIVATE: 'activate', // Announcement
  EXPIRE: 'expire', // Announcement
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
