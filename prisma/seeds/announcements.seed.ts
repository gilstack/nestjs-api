import { faker } from '@faker-js/faker';
import { AnnouncementType, AnnouncementStatus, AnnouncementTarget } from '../../src/shared/infrastructure/database/prisma/generated/client';

export async function seedAnnouncements(prisma: any) {
  console.log('Seeding announcements...');

  // creator
  let creator = await prisma.user.findFirst({ where: { username: 'system' } });
  if (!creator) {
    creator = await prisma.user.create({
      data: {
        username: 'system',
        tag: '0001',
        name: 'System',
        role: 'ADMIN',
        status: 'ACTIVE',
        verifiedAt: new Date(),
      },
    });
    console.log('System user ensured');
  }

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
        creatorId: creator.id,
      });
    }
  }

  // DRAFT
  for (let i = 0; i < 4; i++) {
    announcementsData.push({
      content: `[Rascunho] ${faker.lorem.sentence({ min: 3, max: 5 })}`,
      type: faker.helpers.arrayElement(Object.values(AnnouncementType)),
      status: AnnouncementStatus.DRAFT,
      target: AnnouncementTarget.ALL,
      startedAt: faker.date.soon({ days: 20 }),
      creatorId: creator.id,
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
      creatorId: creator.id,
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
    creatorId: creator.id,
  });

  // batch create
  await prisma.announcement.createMany({
    data: announcementsData,
  });

  console.log(`Created ${announcementsData.length} announcements with Faker data`);
}
