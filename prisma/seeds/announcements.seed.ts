import { faker } from '@faker-js/faker';
import { AnnouncementType, AnnouncementStatus, AnnouncementTarget } from '../../src/shared/infrastructure/database/prisma/generated/client';

export async function seedAnnouncements(prisma: any) {
  console.log('Seeding announcements...');

  // creators
  const manager = await prisma.user.findFirst({ where: { username: 'manager' } });
  const admin = await prisma.user.findFirst({ where: { username: 'admin' } });

  if (!manager || !admin) {
    console.error('❌ Users (admin/manager) not found. Seed users first.');
    return;
  }

  const creators = [manager, admin];

  // clear existing
  await prisma.announcement.deleteMany({});
  console.log('Cleared existing announcements');

  // type configs
  const configs: { type: AnnouncementType; count: number }[] = [
    { type: AnnouncementType.INFO, count: 2 },
    { type: AnnouncementType.WARNING, count: 2 },
    { type: AnnouncementType.NEW, count: 2 },
    { type: AnnouncementType.OFFER, count: 2 },
  ];

  const announcementsData = [];

  // ACTIVE
  for (const config of configs) {
    for (let i = 0; i < config.count; i++) {
      announcementsData.push({
        content: faker.lorem.sentence({ min: 6, max: 8 }),
        url: faker.datatype.boolean({ probability: 0.5 }) ? faker.internet.url() : null,
        type: config.type,
        status: AnnouncementStatus.ACTIVE,
        target: faker.helpers.arrayElement([AnnouncementTarget.ALL, AnnouncementTarget.LOGGED_IN]),
        startedAt: faker.date.recent({ days: 10 }),
        expiredAt: faker.date.soon({ days: 30 }),
        creatorId: faker.helpers.arrayElement(creators).id,
      });
    }
  }

  // DRAFT (Only Manager)
  for (let i = 0; i < 4; i++) {
    announcementsData.push({
      content: `[Rascunho] ${faker.lorem.sentence({ min: 3, max: 5 })}`,
      type: faker.helpers.arrayElement(Object.values(AnnouncementType)),
      status: AnnouncementStatus.DRAFT,
      target: AnnouncementTarget.ALL,
      startedAt: faker.date.soon({ days: 20 }),
      creatorId: manager.id,
    });
  }

  // EXPIRED
  for (let i = 0; i < 2; i++) {
    announcementsData.push({
      content: faker.lorem.sentence({ min: 2, max: 4 }),
      type: faker.helpers.arrayElement([AnnouncementType.INFO, AnnouncementType.OFFER]),
      status: AnnouncementStatus.EXPIRED,
      target: AnnouncementTarget.ALL,
      startedAt: faker.date.recent({ days: 60, refDate: new Date(Date.now() - 86400000 * 30) }),
      expiredAt: faker.date.recent({ days: 10 }),
      creatorId: faker.helpers.arrayElement(creators).id,
    });
  }

  // DELETED
  announcementsData.push({
    content: faker.lorem.sentence({ min: 1, max: 3 }),
    type: AnnouncementType.INFO,
    status: AnnouncementStatus.DELETED,
    target: AnnouncementTarget.ALL,
    startedAt: faker.date.past(),
    deletedAt: faker.date.recent(),
    creatorId: admin.id,
  });

  // batch create
  await prisma.announcement.createMany({
    data: announcementsData,
  });

  console.log(`Created ${announcementsData.length} announcements with Faker data`);
}
