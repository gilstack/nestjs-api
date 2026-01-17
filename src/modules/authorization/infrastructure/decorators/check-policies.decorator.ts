import { SetMetadata } from '@nestjs/common';
import { Action } from '../../domain/enums/action.enum';
import { Subject } from '../../domain/enums/subject.enum';
import type { AppAbility } from '../../domain/types';

export type PolicyHandler = (ability: AppAbility) => boolean;

export const CHECK_POLICIES_KEY = 'check_policies';

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

// Helper to check standard CRUD permissions
export const Can = (action: Action, subject: Subject) =>
  (ability: AppAbility) => ability.can(action, subject);
