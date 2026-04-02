import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateReferralCode() {
  return 'VAULT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

function extractUsername(email: string, displayName: string | null, id: string) {
  if (displayName) {
     return displayName.replace(/\s+/g, '').toLowerCase().slice(0, 12) + '_' + id.slice(0, 4);
  }
  return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + '_' + id.slice(0, 4);
}

async function run() {
  const users = await prisma.user.findMany();
  console.log(`Starting Data Sync for ${users.length} Users...`);

  let modifiedNullKycCount = 0;
  let populatedReferralsCount = 0;

  for (const user of users) {
     const dataToUpdate: any = {};
     
     // 1. Ghost Notification Cleanup
     if (user.kycStatus === 'PENDING' && !user.idDocumentUrl && !user.selfieUrl) {
       dataToUpdate.kycStatus = 'UNVERIFIED';
       modifiedNullKycCount++;
     }

     // 2. Promo Code and Username Migration
     if (!user.referralCode) {
       let code = generateReferralCode();
       // extremely naive collision handling for beta migration
       let codeExists = await prisma.user.findFirst({ where: { referralCode: code } });
       while (codeExists) {
         code = generateReferralCode();
         codeExists = await prisma.user.findFirst({ where: { referralCode: code } });
       }
       dataToUpdate.referralCode = code;
       populatedReferralsCount++;
     }

     if (!user.username) {
       dataToUpdate.username = extractUsername(user.email, user.displayName, user.id);
     }

     if (Object.keys(dataToUpdate).length > 0) {
        await prisma.user.update({
           where: { id: user.id },
           data: dataToUpdate
        });
        console.log(`Updated [${user.email}]`, dataToUpdate);
     }
  }

  console.log('--- SYNC COMPLETE ---');
  console.log(`Eliminated Ghost KYC Notifications: ${modifiedNullKycCount}`);
  console.log(`Users Assigned Referral Codes: ${populatedReferralsCount}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
