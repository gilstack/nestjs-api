export enum Action {
  // Basic CRUD
  Manage = 'manage', // Wildcard for all actions
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',

  // Specific Actions
  Publish = 'publish',
  Archive = 'archive',
  Approve = 'approve',
  Reject = 'reject',
}
