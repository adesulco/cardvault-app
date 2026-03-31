'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Globe } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: 'ID',
    preferredCurrency: 'IDR',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-12">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-white font-bold text-2xl">CV</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
      <p className="text-sm text-gray-500 mt-1">Join CardVault and start trading safely</p>

      <form onSubmit={handleSubmit} className="w-full mt-8 space-y-4">
        <div className="relative">
          <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={formData.displayName}
            onChange={e => update('displayName', e.target.value)}
            placeholder="Display name"
            required
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div className="relative">
          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={e => update('email', e.target.value)}
            placeholder="Email address"
            required
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => update('password', e.target.value)}
            placeholder="Password"
            required
            minLength={8}
            className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={e => update('confirmPassword', e.target.value)}
            placeholder="Confirm password"
            required
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>

        {/* Country */}
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

        {/* Currency preference info */}
        <p className="text-xs text-gray-400 px-1">
          Default currency: {formData.preferredCurrency === 'IDR' ? '🇮🇩 IDR (Indonesian Rupiah)' : '🇺🇸 USD (US Dollar)'}. You can change this anytime.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        {/* Social */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or sign up with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex gap-3">
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Google
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Apple
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-gray-500">
        Already have an account? {' '}
        <Link href="/auth/login" className="text-blue-600 font-semibold">Sign In</Link>
      </p>
    </div>
  );
}
