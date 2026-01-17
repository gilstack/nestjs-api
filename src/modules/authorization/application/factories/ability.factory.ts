import { AbilityBuilder } from '@casl/ability';
import { packRules, PackRule } from '@casl/ability/extra';
import { createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import type { User } from '@modules/user/domain/entities/user.entity';
import { AnnouncementPolicy } from '../../domain/policies/announcement.policy';
import { UserPolicy } from '../../domain/policies/user.policy';
import type { AppAbility } from '../../domain/types';

@Injectable()
export class AbilityFactory {
  createForUser(user: User): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);
    
    new UserPolicy().define(builder, user);
    new AnnouncementPolicy().define(builder, user);
    
    return builder.build();
  }

  createRulesForUser(user: User): PackRule<any>[] {
    const ability = this.createForUser(user);
    return packRules(ability.rules);
  }
}
