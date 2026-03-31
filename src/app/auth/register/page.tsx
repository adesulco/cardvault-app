'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Globe, Phone, Share2, Upload } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    socialMedia: '',
    countryCode: 'ID',
    preferredCurrency: 'IDR',
    userRole: 'BUYER', // BUYER, SELLER, BOTH
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'countryCode') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        preferredCurrency: value === 'ID' ? 'IDR' : 'USD',
      }));
    }
  };

  const handleFileChange = (field: 'id' | 'selfie', file: File | null) => {
    if (field === 'id') {
      setIdDocumentFile(file);
    } else {
      setSelfieFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if ((formData.userRole === 'SELLER' || formData.userRole === 'BOTH') && (!idDocumentFile || !selfieFile)) {
      setError('Sellers must upload ID document and selfie');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual registration API call
      // For now, just show success screen
      setSubmitted(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Application Submitted</h1>
        <p className="text-sm text-gray-600 text-center mb-2">
          Thank you for applying to join CardVault Beta!
        </p>
        <p className="text-sm text-gray-500 text-center mb-6">
          Your application has been received and is pending review. We'll verify your information and notify you within 24-48 hours.
        </p>
        <div className="w-full space-y-2">
          <p className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
            Check your email for verification instructions. You'll be able to log in once your application is approved.
          </p>
        </div>
        <Link href="/auth/login" className="mt-6 text-blue-600 font-medium text-sm">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-12">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-white font-bold text-2xl">CV</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
      <p className="text-sm text-gray-500 mt-1">Apply to join CardVault Beta</p>

      {error && (
        <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
        {/* Basic Info */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Display Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.displayName}
              onChange={e => update('displayName', e.target.value)}
              placeholder="Your trading name"
              required
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="+62 8xx xxx xxxx"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => update('password', e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Confirm Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              required
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Country</label>
          <div className="relative">
            <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={formData.countryCode}
              onChange={e => update('countryCode', e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none"
            >
              <option value="ID">Indonesia</option>
              <option value="US">United States</option>
              <option value="SG">Singapore</option>
              <option value="MY">Malaysia</option>
              <option value="AU">Australia</option>
              <option value="JP">Japan</option>
              <option value="GB">United Kingdom</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">What do you want to do?</label>
          <div className="space-y-2">
            {[
              { value: 'BUYER', label: 'I want to Buy cards' },
              { value: 'SELLER', label: 'I want to Sell cards' },
              { value: 'BOTH', label: 'Both Buy and Sell' },
            ].map(role => (
              <label key={role.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={formData.userRole === role.value}
                  onChange={e => update('userRole', e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{role.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Seller Fields */}
        {(formData.userRole === 'SELLER' || formData.userRole === 'BOTH') && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium">Seller Verification Required</p>
              <p className="text-xs text-blue-700 mt-1">To sell on CardVault, you'll need to upload ID verification and a selfie.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Social Media / Webstore (optional)</label>
              <div className="relative">
                <Share2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={formData.socialMedia}
                  onChange={e => update('socialMedia', e.target.value)}
                  placeholder="https://instagram.com/your-store"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">ID Document (KTP/Passport)</label>
              <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs text-gray-600">{idDocumentFile ? idDocumentFile.name : 'Click to upload ID document'}</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange('id', e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Selfie Verification</label>
              <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs text-gray-600">{selfieFile ? selfieFile.name : 'Click to upload selfie'}</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange('selfie', e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 mt-6"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-500">
        Already have an account? {' '}
        <Link href="/auth/login" className="text-blue-600 font-semibold">Sign In</Link>
      </p>
    </div>
  );
}
