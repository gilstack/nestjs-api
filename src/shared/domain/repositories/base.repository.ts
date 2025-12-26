/**
 * Base repository interface with optional CRUD methods.
 * Implement only the methods your repository needs.
 *
 * @typeParam T - The entity type
 * @typeParam CreateInput - The input type for creating entities
 * @typeParam UpdateInput - The input type for updating entities
 * @typeParam ID - The ID type (defaults to string)
 */
export interface IBaseRepository<
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T>,
  ID = string,
> {
  /**
   * Find an entity by its ID
   */
  findById?(id: ID): Promise<T | null>;

  /**
   * Find all entities
   */
  findAll?(): Promise<T[]>;

  /**
   * Create a new entity
   */
  create?(data: CreateInput): Promise<T>;

  /**
   * Update an existing entity
   */
  update?(id: ID, data: UpdateInput): Promise<T>;

  /**
   * Delete an entity (hard delete)
   */
  delete?(id: ID): Promise<void>;

  /**
   * Soft delete an entity (set deletedAt)
   */
  softDelete?(id: ID): Promise<T>;

  /**
   * Restore a soft-deleted entity
   */
  restore?(id: ID): Promise<T>;

  /**
   * Check if an entity exists
   */
  exists?(id: ID): Promise<boolean>;

  /**
   * Count total entities
   */
  count?(): Promise<number>;
}
