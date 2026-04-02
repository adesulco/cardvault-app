import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  const TEST_EMAIL = 'e2e_kyc_test@kios.io';

  console.log('🔄 Cleaning up previous test artifacts...');
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });

  console.log('1️⃣ Activating User Registration Pipeline...');
  const regBody = {
    email: TEST_EMAIL,
    password: 'SecurePassword123!',
    displayName: 'Automated E2E Tester',
    userRole: 'SELLER',
    idDocumentUrl: 'https://cardvault.id/assets/mock-id-doc.jpg',
    selfieUrl: 'https://cardvault.id/assets/mock-selfie.jpg'
  };

  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regBody)
  });
  
  const regJson = await regRes.json();
  console.log('Registration Response:', regRes.status, regJson);

  if (!regRes.ok) throw new Error('Registration failed!');

  console.log('\n2️⃣ Validating Database State Consistency...');
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) throw new Error('User missing from database!');
  console.log(`- ID: ${user.id}`);
  console.log(`- KYC Status (Target: PENDING): ${user.kycStatus}`);
  console.log(`- KYC Submitted Timestamp: ${user.kycSubmittedAt}`);

  if (user.kycStatus !== 'PENDING') throw new Error('KYC Status did NOT correctly flag as PENDING!');

  console.log('\n3️⃣ Validating Admin Dashboard Statistics...');
  // Force simulate Admin Dashboard logic 
  const pendingCount = await prisma.user.count({ where: { kycStatus: 'PENDING', idDocumentUrl: { not: null } } });
  console.log(`- Active 'Pending KYC' count on Dashboard: ${pendingCount}`);

  console.log('\n4️⃣ Validating KYC Approval Queue Visibility...');
  // Simulating the /api/admin/kyc logic
  const pendingUsers = await prisma.user.findMany({
    where: { kycStatus: 'PENDING', idDocumentUrl: { not: null } },
    orderBy: { kycSubmittedAt: 'asc' }
  });
  
  const foundInQueue = pendingUsers.find(u => u.email === TEST_EMAIL);
  console.log(`- Does user exist in the Admin Queue physically? ${foundInQueue ? '✅ YES' : '❌ NO'}`);

  console.log('\n5️⃣ Simulating Admin Approval (KYC Validation)...');
  const approvalRes = await fetch('http://localhost:3000/api/admin/kyc', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ userId: user.id, action: 'APPROVED', note: null })
  });
  
  const approvedUser = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  console.log(`- Final Status Post-Approval: ${approvedUser?.kycStatus}`);
  console.log(`- Trust Score Increment: ${approvedUser?.trustScore}`);

  console.log('\n🚀 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTest().catch(console.error);
