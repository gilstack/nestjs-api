import { AccountProvider, UserRole, UserStatus } from '../../src/shared/infrastructure/database/prisma/generated/client';

export async function seedUsers(prisma: any) {
  console.log('Seeding users...');

  const users = [
    {
      username: 'admin',
      tag: '0000',
      name: 'Admin User',
      role: UserRole.ADMIN,
      email: 'admin@storagie.com',
    },
    {
      username: 'manager',
      tag: '0001',
      name: 'Manager User',
      role: UserRole.MANAGER,
      email: 'manager@storagie.com',
    },
    {
      username: 'user',
      tag: '0002',
      name: 'Regular User',
      role: UserRole.USER,
      email: 'user@storagie.com',
    },
  ];

  for (const u of users) {
    let user = await prisma.user.findFirst({
      where: { username: u.username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: u.username,
          tag: u.tag,
          name: u.name,
          role: u.role,
          status: UserStatus.ACTIVE,
          verifiedAt: new Date(),
          accounts: {
            create: {
              identifier: u.email,
              provider: AccountProvider.EMAIL,
              verifiedAt: new Date(),
            },
          },
        },
      });
      console.log(`Created user: ${u.username} (${u.role})`);
    } else {
      // Ensure account exists
      const account = await prisma.account.findUnique({
         where: { identifier: u.email }
      });
      
      if (!account) {
          await prisma.account.create({
              data: {
                  userId: user.id,
                  identifier: u.email,
                  provider: AccountProvider.EMAIL,
                  verifiedAt: new Date()
              }
          });
          console.log(`Created account for existing user: ${u.username}`);
      } else {
        console.log(`User ${u.username} already exists`);
      }
    }
  }
}
