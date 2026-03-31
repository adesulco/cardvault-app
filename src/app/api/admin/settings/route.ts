import { NextRequest, NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const gateways = await prisma.gatewayConfiguration.findMany({
      select: {
        id: true,
        gatewayName: true,
        isActive: true,
        priorityOrder: true,
        supportedCurrencies: true,
        supportedPaymentMethods: true,
        status: true,
        lastHealthCheckAt: true,
      },
    });

    return NextResponse.json({
      gateways,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const payload = await request.json();
    const { action, currentPassword, newPassword } = payload;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    if (action === 'change_password') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'currentPassword and newPassword are required' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters' },
          { status: 400 }
        );
      }

      // Get admin user from token
      const token = request.cookies.get('admin_token')?.value;
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Note: In production, extract user ID from JWT properly
      // For now, we would need the userId in some way
      // This is a simplified version - in real app you'd get userId from JWT payload
      const jwtVerify = require('jose').jwtVerify;
      const SECRET = new TextEncoder().encode(
        process.env.ADMIN_JWT_SECRET || 'cardvault-admin-secret-key-2024'
      );

      let userId: string;
      try {
        const { payload } = await jwtVerify(token, SECRET);
        userId = payload.sub as string;
      } catch {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const isValid = await compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
