import type { AbilityBuilder } from '@casl/ability';

import { AnnouncementStatus } from '@modules/announcement/domain/enums';
import { UserRole } from '@modules/user/domain/enums';
import { Action } from '../enums/action.enum';
import { Subject } from '../enums/subject.enum';

import type { User } from '@modules/user/domain/entities/user.entity';
import type { AppAbility } from '../types';
import type { IPolicy } from './policy.interface';

export class AnnouncementPolicy implements IPolicy {
  define(builder: AbilityBuilder<AppAbility>, user: User): void {
    const { can, cannot } = builder;

    // Admin can manage everything
    if (user.role === UserRole.ADMIN) {
      can(Action.Manage, Subject.Announcement);
      can(Action.Update, Subject.Announcement);
      return;
    }

    // Manager can create, read all, and update their own
    if (user.role === UserRole.MANAGER) {
      can(Action.Create, Subject.Announcement);
      can(Action.Read, Subject.Announcement);
      can(Action.Update, Subject.Announcement, { creatorId: user.id });
    }

    // Cannot delete published announcements unless Admin (Admins returned early)
    cannot(Action.Delete, Subject.Announcement, { status: AnnouncementStatus.ACTIVE });
  }
}
