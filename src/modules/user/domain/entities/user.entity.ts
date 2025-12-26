import type { UserRole, UserStatus } from '@prisma/client';

export interface Account {
  id: string;
  userId: string;
  identifier: string;
  provider: 'EMAIL' | 'GOOGLE' | 'GITHUB';
  providerId: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  tag: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  accounts?: Account[];
}

export interface CreateUserInput {
  username: string;
  tag: string;
  role?: UserRole;
  status?: UserStatus;
  name?: string;
  image?: string;
  bio?: string;
}

export interface CreateAccountInput {
  identifier: string;
  provider: 'EMAIL' | 'GOOGLE' | 'GITHUB';
  providerId?: string;
}

export interface UpdateUserInput {
  username?: string;
  tag?: string;
  name?: string | null;
  image?: string | null;
  bio?: string | null;
  role?: UserRole;
  status?: UserStatus;
  verifiedAt?: Date | null;
  deletedAt?: Date | null;
}
