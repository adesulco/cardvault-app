'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useAppStore } from '@/lib/store';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycStatus, setKycStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
  const { setUser } = useAppStore();
  const [kycReviewNote, setKycReviewNote] = useState('');

  useEffect(() => {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const oauthError = searchParams?.get('error');
    if (oauthError === 'OAuthSignin' || oauthError === 'OAuthCallback') {
      setError('Google Sign-in failed. Please try again or use email login.');
    } else if (oauthError) {
      setError('An authentication error occurred. Please try again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setKycStatus(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store user session within the persisted global store
      setUser(data.user);
      const safeStore = { ...data.user };
      delete safeStore.role;
      delete safeStore.isAdmin;
      localStorage.setItem('cardvault_user', JSON.stringify(safeStore)); // stripped fallback


      // Check KYC status
      const userKycStatus = data.user.kycStatus;

      if (userKycStatus === 'REJECTED') {
        setKycStatus('REJECTED');
        setKycReviewNote('Your application was declined due to incomplete documentation.');
        setLoading(false);
        return;
      }

      // APPROVED or PENDING — let user in natively
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const callbackUrl = searchParams?.get('callbackUrl') || '/';
      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getCallbackUrl = () => {
    return typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('callbackUrl') || '/' 
      : '/';
  };


  // Show KYC rejected message
  if (kycStatus === 'REJECTED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Application Not Approved</h1>
        <p className="text-sm text-gray-600 text-center mb-2">Your application was reviewed and not approved at this time.</p>
        {kycReviewNote && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-6">{kycReviewNote}</p>
        )}
        <p className="text-xs text-gray-500 text-center mb-6">
          Please contact support@cardvault.id for more information or to reapply.
        </p>
        <button
          onClick={() => {
            setKycStatus(null);
            setEmail('');
            setPassword('');
          }}
          className="text-blue-600 font-medium text-sm"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      {/* Logo */}
      <BrandLogo size={64} className="mb-6" />
      <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
      <p className="text-sm text-slate-500 mt-1">Sign in to your CardVault account</p>

      <button
         onClick={() => signIn('google', { callbackUrl: getCallbackUrl() })}
         className="w-full mt-6 flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-200 shadow-sm rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
      >
         <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path
               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
               fill="#4285F4"
            />
            <path
               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
               fill="#34A853"
            />
            <path
               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
               fill="#FBBC05"
            />
            <path
               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
               fill="#EA4335"
            />
         </svg>
         Continue with Google
      </button>

      <div className="flex items-center w-full mt-6 opacity-60">
         <div className="flex-1 border-t border-slate-300"></div>
         <span className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">or email</span>
         <div className="flex-1 border-t border-slate-300"></div>
      </div>

      {error && (
        <div className="w-full mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
        <div className="relative">
          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-xs text-blue-600 font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-500">
        Don&apos;t have an account? {' '}
        <Link href="/auth/register" className="text-blue-600 font-semibold">Sign Up</Link>
      </p>
    </div>
  );
}
