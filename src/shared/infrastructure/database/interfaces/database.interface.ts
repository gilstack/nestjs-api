export interface IDatabaseService {
  /**
   * Connect to the database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Check if database is healthy
   */
  healthCheck(): Promise<boolean>;
}
