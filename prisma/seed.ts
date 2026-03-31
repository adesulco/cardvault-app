import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'adesulistioputra@gmail.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const passwordHash = await hash('cardvault2024', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'adesulistioputra@gmail.com',
        displayName: 'Admin',
        passwordHash,
        isAdmin: true,
        kycStatus: 'APPROVED',
        userRole: 'ADMIN',
        isEmailVerified: true,
        countryCode: 'ID',
        preferredCurrency: 'IDR',
      },
    });

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
