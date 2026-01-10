export enum AnnouncementType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  NEW = 'NEW',
  OFFER = 'OFFER',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export enum AnnouncementTarget {
  ALL = 'ALL',
  LOGGED_IN = 'LOGGED_IN',
  GUEST = 'GUEST',
  USER = 'USER',
}
