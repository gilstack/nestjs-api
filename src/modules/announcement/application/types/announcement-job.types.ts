/**
 * Action types for announcement scheduling jobs
 */
export type AnnouncementJobAction = 'activate' | 'expire';

/**
 * Data payload for announcement jobs in the queue
 */
export interface AnnouncementJobData {
  /** The announcement ID to process */
  announcementId: string;

  /** The action to perform */
  action: AnnouncementJobAction;

  /** Expected timestamp for validation (prevents stale job execution) */
  expectedDate: number;

  /** When the job was scheduled (for audit logging) */
  scheduledAt: number;
}

/**
 * Result returned by the job processor
 */
export interface AnnouncementJobResult {
  /** Whether the transition was successful */
  success: boolean;

  /** The action that was attempted */
  action: AnnouncementJobAction;

  /** The announcement ID that was processed */
  announcementId: string;

  /** Reason for skipping (if success is false) */
  reason?: string;
}
