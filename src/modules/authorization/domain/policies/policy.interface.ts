import type { AbilityBuilder } from '@casl/ability';
import type { User } from '@modules/user/domain/entities/user.entity';
import type { AppAbility } from '../types';

export interface IPolicy {
  define(builder: AbilityBuilder<AppAbility>, user: User): void;
}
