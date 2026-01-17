import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../src/shared/infrastructure/database/prisma/generated/client';

import { seedAnnouncements } from './announcements.seed';
import { seedUsers } from './users.seed';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed!');

  try {
    await seedUsers(prisma);
    await seedAnnouncements(prisma);

    console.log('Database seed completed successfully.');
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
