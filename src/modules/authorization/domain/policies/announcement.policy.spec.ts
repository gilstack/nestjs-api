import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { AnnouncementPolicy } from './announcement.policy';
import { UserRole } from '@modules/user/domain/enums';
import { AnnouncementStatus, AnnouncementType, AnnouncementTarget } from '@modules/announcement/domain/enums';
import { Action } from '../enums/action.enum';
import { Subject } from '../enums/subject.enum';
import { AppSubjects } from '../types';
import { User } from '@modules/user/domain/entities/user.entity';

type TestAbility = MongoAbility<[Action, AppSubjects]>;

describe('AnnouncementPolicy', () => {
  let policy: AnnouncementPolicy;

  beforeEach(() => {
    policy = new AnnouncementPolicy();
  });

  const mockUser = (role: UserRole, id = 'user-1'): User => ({
    id,
    role,
    username: 'test',
    tag: '1234',
    name: 'Test User',
    image: null,
    bio: null,
    status: 'ACTIVE' as any,
    verifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const buildAbility = (user: User) => {
    const { can, cannot, rules } = new AbilityBuilder<TestAbility>(createMongoAbility);
    policy.define({ can, cannot, build: () => null } as any, user); 
    return createMongoAbility<TestAbility>(rules);
  };

  it('should allow ADMIN to manage all announcements', () => {
    const user = mockUser(UserRole.ADMIN);
    const ability = buildAbility(user);

    expect(ability.can(Action.Manage, Subject.Announcement)).toBe(true);
    expect(ability.can(Action.Delete, Subject.Announcement)).toBe(true);
  });

  it('should allow MANAGER to create announcements', () => {
    const user = mockUser(UserRole.MANAGER);
    const ability = buildAbility(user);

    expect(ability.can(Action.Create, Subject.Announcement)).toBe(true);
  });

  it('should allow MANAGER to update their own announcements', () => {
    const user = mockUser(UserRole.MANAGER, 'manager-1');
    const ability = buildAbility(user);
    const announcement = { creatorId: 'manager-1' };

    expect(ability.can(Action.Update, { ...announcement, __caslSubjectType__: Subject.Announcement } as any)).toBe(true);
  });
  
  it('should NOT allow MANAGER to delete ANY announcements', () => {
      const user = mockUser(UserRole.MANAGER, 'manager-1');
      const ability = buildAbility(user);
      
      const announcement = { 
        __caslSubjectType__: Subject.Announcement, 
        creatorId: 'manager-1',
        status: AnnouncementStatus.ACTIVE
      };

      expect(ability.can(Action.Delete, announcement as any)).toBe(false);
  });

  it('should NOT allow USER to read announcements via Policy (access controlled by Public decorator)', () => {
    const user = mockUser(UserRole.USER);
    const ability = buildAbility(user);

    expect(ability.can(Action.Read, { __caslSubjectType__: Subject.Announcement, status: AnnouncementStatus.ACTIVE } as any)).toBe(false);
  });
  
  it('should NOT allow USER to read DRAFT announcements', () => {
    const user = mockUser(UserRole.USER);
    const ability = buildAbility(user);

    expect(ability.can(Action.Read, { __caslSubjectType__: Subject.Announcement, status: AnnouncementStatus.DRAFT } as any)).toBe(false);
  });
});
