import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';

import type { User } from '@modules/user/domain/entities/user.entity';
import { AnnouncementPolicy } from '../../domain/policies/announcement.policy';
import { UserPolicy } from '../../domain/policies/user.policy';
import type { AppAbility } from '../../domain/types';

@Injectable()
export class AbilityFactory {
  createForUser(user: User): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);
    
    // Apply policies
    new UserPolicy().define(builder, user);
    new AnnouncementPolicy().define(builder, user);
    
    return builder.build();
  }
}
