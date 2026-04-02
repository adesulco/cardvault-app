import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
           select: { listings: true, buyerTransactions: true, sellerTransactions: true }
        }
      }
    });

    const mapped = users.map(u => {
       const hasListingsOrSales = u._count.listings > 0 || u._count.sellerTransactions > 0;
       const hasPurchases = u._count.buyerTransactions > 0;
       let visualRole: any = u.userRole;
       if (visualRole !== 'ADMIN') {
          if (hasListingsOrSales && hasPurchases) visualRole = 'BOTH';
          else if (hasListingsOrSales) visualRole = 'SELLER';
          else visualRole = 'BUYER';
       }
       return {
         ...u,
         userRole: visualRole
       };
    });

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const { email, password, displayName, role } = await request.json();
    if (!email || !password) return NextResponse.json({error: 'Missing fields'}, {status: 400});
    
    // Hash password so they can log in via Native Credentials instead of Google
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
       data: { 
         email, 
         passwordHash, 
         displayName, 
         role, 
         isAdmin: true,
         userRole: 'ADMIN',
         kycStatus: 'APPROVED'
       }
    });
    return NextResponse.json(user);
  } catch(e) {
    return NextResponse.json({error: 'Failed to provision admin'}, {status: 500});
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
     const { id, action } = await request.json();
     if (action === 'suspend') {
        const u = await prisma.user.findUnique({where: {id}});
        await prisma.user.update({ where: {id}, data: { isSuspended: !u?.isSuspended }});
     } else if (action === 'delete') {
        await prisma.user.delete({ where: {id}});
     }
     return NextResponse.json({success: true});
  } catch(e) {
     return NextResponse.json({error: 'Failed mutation'}, {status: 500});
  }
}
