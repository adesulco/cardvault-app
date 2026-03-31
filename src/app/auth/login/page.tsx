'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycStatus, setKycStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null);
  const [kycReviewNote, setKycReviewNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setKycStatus(null);
    setLoading(true);

    try {
      // TODO: Implement actual login API call
      // For now, show mock KYC status flow
      // In real implementation, this would call /api/auth/login

      // Mock: simulate checking KYC status
      const mockKycStatus = 'PENDING'; // Change to test different flows

      if (mockKycStatus === 'PENDING') {
        setKycStatus('PENDING');
        setLoading(false);
        return;
      }

      if (mockKycStatus === 'REJECTED') {
        setKycStatus('REJECTED');
        setKycReviewNote('Your application was declined due to incomplete documentation.');
        setLoading(false);
        return;
      }

      if (mockKycStatus === 'APPROVED') {
        // Set auth cookie and redirect
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Show KYC pending message
  if (kycStatus === 'PENDING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Account Pending Review</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Your application is being reviewed. We'll notify you via email once it's approved. This usually takes 24-48 hours.
        </p>
        <button
          onClick={() => {
            setKycStatus(null);
            setEmail('');
            setPassword('');
          }}
          className="text-blue-600 font-medium text-sm"
        >
          Try with different credentials
        </button>
      </div>
    );
  }

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
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-white font-bold text-2xl">CV</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
      <p className="text-sm text-gray-500 mt-1">Sign in to your CardVault account</p>

      {error && (
        <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
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
        Don't have an account? {' '}
        <Link href="/auth/register" className="text-blue-600 font-semibold">Sign Up</Link>
      </p>
    </div>
  );
}
