import type { MongoAbility } from '@casl/ability';
import type { Announcement } from '@modules/announcement/domain/entities/announcement.entity';
import type { MagicLinkToken } from '@modules/authentication/domain/entities/magic-link-token.entity';
import type { Session } from '@modules/authentication/domain/entities/session.entity';
import type { User } from '@modules/user/domain/entities/user.entity';
import type { Action } from '../enums/action.enum';
import type { Subject } from '../enums/subject.enum';

export type AppSubjects = 
  | Subject
  | Announcement
  | MagicLinkToken
  | Session
  | User
  | 'all';

export type AppAbility = MongoAbility<[Action, AppSubjects]>;
