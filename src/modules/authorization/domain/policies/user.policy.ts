import type { AbilityBuilder } from '@casl/ability';
import { UserRole } from '@modules/user/domain/enums';
import type { User } from '@modules/user/domain/entities/user.entity';

import { Action } from '../enums/action.enum';
import { Subject } from '../enums/subject.enum';
import type { AppAbility } from '../types';
import type { IPolicy } from './policy.interface';

export class UserPolicy implements IPolicy {
  define(builder: AbilityBuilder<AppAbility>, user: User): void {
    const { can } = builder;

    // Admin can manage everything
    if (user.role === UserRole.ADMIN) {
      can(Action.Manage, Subject.User);
      return;
    }

    // Users can read and update their own profile
    can(Action.Read, Subject.User, { id: user.id });
    can(Action.Update, Subject.User, { id: user.id });
  }
}
