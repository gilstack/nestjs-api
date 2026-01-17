import { Test, TestingModule } from '@nestjs/testing';
import { AbilityFactory } from './ability.factory';
import { UserPolicy } from '../../domain/policies/user.policy';
import { AnnouncementPolicy } from '../../domain/policies/announcement.policy';
import { UserRole } from '@modules/user/domain/enums';
import { Action } from '../../domain/enums/action.enum';
import { Subject } from '../../domain/enums/subject.enum';

describe('AbilityFactory', () => {
  let factory: AbilityFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbilityFactory,
        UserPolicy,
        AnnouncementPolicy,
      ],
    }).compile();

    factory = module.get<AbilityFactory>(AbilityFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  it('should create an ability for a user', () => {
    const user = {
      id: 'user-1',
      role: UserRole.USER,
      username: 'test',
      tag: '1234',
      name: 'Test User',
      image: null,
      bio: null,
      status: 'ACTIVE',
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as any;

    const ability = factory.createForUser(user);
    expect(ability).toBeDefined();
    
    // Check basic permissions
    expect(ability.can(Action.Read, Subject.Announcement)).toBe(true); // Conditional permission, but can returns true for checking subject logic? 
    // Actually can(Read, Subject.Announcement) checks if there are ANY read permissions for Announcement.
    // If I restrict to status ACTIVE, a generic check might fail depending on CASL configuration, but usually it means "is it possible to read announcement?" yes.
  });
});
