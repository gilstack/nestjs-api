import type { Announcement } from '../entities/announcement.entity';

/**
 * Interface for scheduling announcement status transitions.
 * Implementations handle job creation, cancellation, and rescheduling.
 */
export interface IAnnouncementScheduler {
  /**
   * Schedule activation job for a SCHEDULED announcement.
   * Job will execute at startedAt time.
   * @returns Job ID if scheduled, null if not applicable
   */
  scheduleActivation(announcement: Announcement): Promise<string | null>;

  /**
   * Schedule expiration job for an ACTIVE announcement.
   * Job will execute at expiredAt time.
   * @returns Job ID if scheduled, null if not applicable
   */
  scheduleExpiration(announcement: Announcement): Promise<string | null>;

  /**
   * Cancel all pending jobs for an announcement.
   * Called before deletion or when rescheduling.
   */
  cancelJobs(announcementId: string): Promise<void>;

  /**
   * Reschedule jobs after an update.
   * Cancels existing jobs and creates new ones based on current state.
   */
  reschedule(announcement: Announcement): Promise<void>;
}
