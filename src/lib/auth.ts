import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.sub,
          displayName: profile.name,
          email: profile.email,
          avatarUrl: profile.picture,
          // Defaults for our proprietary ecosystem
          userRole: 'BUYER',
          kycStatus: 'UNVERIFIED',
          countryCode: 'ID',
          preferredCurrency: 'IDR'
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Wrong password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.userRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).userRole || (user as any).role || 'BUYER';
        token.displayName = (user as any).displayName || user.name;
        token.kycStatus = (user as any).kycStatus || 'UNVERIFIED';
        token.avatarUrl = (user as any).avatarUrl || user.image;
        token.walletBalanceIdr = (user as any).walletBalanceIdr || 0;
        token.coinBalance = (user as any).coinBalance || 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).userRole = token.role;
        (session.user as any).displayName = token.displayName;
        (session.user as any).kycStatus = token.kycStatus;
        (session.user as any).avatarUrl = token.avatarUrl;
        (session.user as any).walletBalanceIdr = token.walletBalanceIdr;
        (session.user as any).coinBalance = token.coinBalance;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev',
};
