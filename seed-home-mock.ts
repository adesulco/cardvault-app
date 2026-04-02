import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding mock data for CardVault Home...');

  // 1. Wipe existing mock banners to prevent duplicates during testing
  await prisma.banner.deleteMany({});

  // 2. Mock promotional banners utilizing highly relevant gaming/card images from Unsplash
  await prisma.banner.createMany({
    data: [
      {
         imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1600&auto=format&fit=crop', // Beautiful card grading aesthetic
         linkUrl: '#',
         altText: 'Premium Vault Security',
         isActive: true,
         sortOrder: 1
      },
      {
         imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=1600&auto=format&fit=crop', // Pokemon cards
         linkUrl: '#',
         altText: 'Pokemon Grails Event',
         isActive: true,
         sortOrder: 2
      },
      {
         imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=1600&auto=format&fit=crop', // Basketball aesthetic
         linkUrl: '#',
         altText: 'Sports Cards Selection',
         isActive: true,
         sortOrder: 3
      }
    ]
  });

  console.log('Banners created!');

  // 3. Mock High-Profile Users (Card Stores)
  const store1 = await prisma.user.upsert({
    where: { email: 'hello@kioskultura.com' },
    update: { 
       trustScore: 99, 
       kycStatus: 'APPROVED', 
       avatarUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=400&auto=format&fit=crop' 
    },
    create: {
      email: 'hello@kioskultura.com',
      username: 'kioskultura',
      displayName: 'KiosKultura SG',
      trustScore: 99,
      kycStatus: 'APPROVED',
      userRole: 'SELLER',
      avatarUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=400&auto=format&fit=crop',
      idDocumentUrl: 'mocked-id'
    }
  });

  const store2 = await prisma.user.upsert({
    where: { email: 'info@hobbymaster.com' },
    update: { 
       trustScore: 96, 
       kycStatus: 'APPROVED',
       avatarUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400&auto=format&fit=crop'
    },
    create: {
      email: 'info@hobbymaster.com',
      username: 'hobbymaster',
      displayName: 'Hobby Master ID',
      trustScore: 96,
      kycStatus: 'APPROVED',
      userRole: 'SELLER',
      avatarUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400&auto=format&fit=crop',
      idDocumentUrl: 'mocked-id'
    }
  });
  
  const store3 = await prisma.user.upsert({
    where: { email: 'sales@collectorsvault.com' },
    update: { 
       trustScore: 92, 
       kycStatus: 'APPROVED',
       avatarUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop'
    },
    create: {
      email: 'sales@collectorsvault.com',
      username: 'collectorsvault',
      displayName: 'Collectors Vault',
      trustScore: 92,
      kycStatus: 'APPROVED',
      userRole: 'SELLER',
      avatarUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop',
      idDocumentUrl: 'mocked-id'
    }
  });

  console.log('Featured stores created!');

  // 4. Trending Listings (Cards & Listings combined)
  const card1 = await prisma.card.create({
     data: {
        ownerId: store1.id,
        cardName: 'Pikachu Illustrator Promo Promo',
        sportOrCategory: 'Pokémon',
        condition: 'graded',
        grade: 'PSA 9',
        frontImageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=600&auto=format&fit=crop',
        status: 'listed_sale'
     }
  });

  await prisma.listing.create({
     data: {
        sellerId: store1.id,
        cardId: card1.id,
        listingType: 'sale',
        priceIdr: 45000000,
        priceUsd: 3000,
        status: 'active',
        viewsCount: 1350
     }
  });

  const card2 = await prisma.card.create({
     data: {
        ownerId: store2.id,
        cardName: 'Michael Jordan Rookie Fleer 1986',
        sportOrCategory: 'Basketball',
        condition: 'graded',
        grade: 'BGS 9.5',
        frontImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop',
        status: 'listed_sale'
     }
  });

  await prisma.listing.create({
     data: {
        sellerId: store2.id,
        cardId: card2.id,
        listingType: 'sale',
        priceIdr: 125000000,
        priceUsd: 8200,
        status: 'active',
        viewsCount: 890
     }
  });
  
  const card3 = await prisma.card.create({
     data: {
        ownerId: store3.id,
        cardName: 'Charizard Holographic 1st Edition',
        sportOrCategory: 'Pokémon',
        condition: 'graded',
        grade: 'PSA 10',
        frontImageUrl: 'https://images.unsplash.com/photo-1643321528646-3f6e1e621128?q=80&w=600&auto=format&fit=crop', // Fire theme approximation
        status: 'listed_sale'
     }
  });

  await prisma.listing.create({
     data: {
        sellerId: store3.id,
        cardId: card3.id,
        listingType: 'sale',
        priceIdr: 250000000,
        priceUsd: 15400,
        status: 'active',
        viewsCount: 2240
     }
  });

  console.log('Trending cards & listings mapped to stores!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
