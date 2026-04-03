import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Banners
  const existingBanners = await prisma.banner.findMany();
  if (existingBanners.length === 0) {
    await prisma.banner.create({
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1611024847487-e26177381a38?auto=format&fit=crop&w=1200&q=80',
        altText: 'CardVault Beta: Trade with confidence. Your cards, your money - protected.',
        linkUrl: '/explore',
        isActive: true,
        sortOrder: 1,
      }
    });
    await prisma.banner.create({
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1541944685023-eb1947b1961e?auto=format&fit=crop&w=1200&q=80',
        altText: 'Authorized Vaults: Join the growing network of verified collectors.',
        linkUrl: '/explore?tab=vaults',
        isActive: true,
        sortOrder: 2,
      }
    });
    console.log('Mocked Banners injected');
  }

  // 2. Featured Sellers
  let users = await prisma.user.findMany({ take: 3 });
  if (users.length === 0) {
    const mockUser = await prisma.user.create({
      data: {
        email: 'vault-official@cardvault.id',
        displayName: 'CardVault Official',
        username: 'cardvault',
        userRole: 'ADMIN',
        totalTransactions: 154,
        trustScore: 100,
        avatarUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&q=80'
      }
    });
    const mockUser2 = await prisma.user.create({
      data: {
        email: 'pkmaster@gmail.com',
        displayName: 'Kanto Curator',
        username: 'kanto_curator',
        userRole: 'SELLER',
        totalTransactions: 89,
        trustScore: 98,
        avatarUrl: 'https://images.unsplash.com/photo-1542779283-429944ce3307?w=200&q=80'
      }
    });
    users = [mockUser, mockUser2];
    console.log('Mocked Users injected');
  }

  await prisma.platformConfig.upsert({
    where: { configKey: 'featured_sellers' },
    update: { configValue: JSON.stringify(users.map(u => u.id)) },
    create: { configKey: 'featured_sellers', configValue: JSON.stringify(users.map(u => u.id)), description: 'Top Sellers' }
  });

  // 3. Featured Cards/Listings
  let listings = await prisma.listing.findMany({ where: { status: 'active' }, take: 4 });
  if (listings.length === 0) {
     if (users.length > 0) {
        const card = await prisma.card.create({
           data: {
              cardName: 'Charizard Base Set Holo - Unlimited',
              ownerId: users[0].id,
              condition: 'graded',
              gradingCompany: 'PSA',
              grade: '10',
              sportOrCategory: 'Pokémon',
              frontImageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80'
           }
        });
        const listing = await prisma.listing.create({
           data: {
              cardId: card.id,
              sellerId: users[0].id,
              priceIdr: 15500000,
              status: 'active'
           }
        });
        
        const card2 = await prisma.card.create({
           data: {
              cardName: 'LeBron James Topps Chrome RC',
              ownerId: users[1] ? users[1].id : users[0].id,
              condition: 'raw',
              sportOrCategory: 'Basketball',
              frontImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80'
           }
        });
        const listing2 = await prisma.listing.create({
           data: {
              cardId: card2.id,
              sellerId: users[1] ? users[1].id : users[0].id,
              priceIdr: 35000000,
              status: 'active'
           }
        });

        const card3 = await prisma.card.create({
           data: {
              cardName: 'Blue-Eyes White Dragon LOB-001',
              ownerId: users[0].id,
              condition: 'graded',
              grade: 'BGS 9.5',
              sportOrCategory: 'Yu-Gi-Oh!',
              frontImageUrl: 'https://images.unsplash.com/photo-1621508654686-809f23efd60d?auto=format&fit=crop&w=600&q=80'
           }
        });
        const listing3 = await prisma.listing.create({
           data: {
              cardId: card3.id,
              sellerId: users[0].id,
              priceIdr: 42000000,
              status: 'active'
           }
        });
        
        listings = [listing, listing2, listing3];
        console.log('Mocked Listings injected');
     }
  }

  await prisma.platformConfig.upsert({
    where: { configKey: 'featured_listings' },
    update: { configValue: JSON.stringify(listings.map(l => l.id)) },
    create: { configKey: 'featured_listings', configValue: JSON.stringify(listings.map(l => l.id)), description: 'Top Listings' }
  });

  console.log('Home Page seeding complete. CRM Config mapping successfully overwritten.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
