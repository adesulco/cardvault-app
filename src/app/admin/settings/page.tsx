'use client';
import { useState, useEffect } from 'react';

interface GatewayConfig {
  id: string;
  gatewayName: string;
  isActive: boolean;
  status: string;
}

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('CardVault');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gateways, setGateways] = useState<GatewayConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      // This would fetch from a real API
      setGateways([
        { id: '1', gatewayName: 'Midtrans', isActive: true, status: 'healthy' },
        { id: '2', gatewayName: 'Xendit', isActive: true, status: 'healthy' },
        { id: '3', gatewayName: 'Stripe', isActive: false, status: 'degraded' },
      ]);
    } catch (error) {
      console.error('Failed to fetch gateways:', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // In a real app, this would POST to an API
      // For now, just show success
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // In a real app, this would POST to an API
      setMessage('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-100 text-emerald-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage platform configuration and admin settings</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 pb-4 border-b border-slate-200">Platform Settings</h2>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gate Password</label>
            <input
              type="password"
              value={gatePassword}
              onChange={(e) => setGatePassword(e.target.value)}
              placeholder="Set password to access gate page"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Required password for /gate page access</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700">Maintenance Mode</label>
              <p className="text-xs text-slate-500">Show maintenance page to users</p>
            </div>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                maintenanceMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
              }`}
            >
              {maintenanceMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Gateways */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 pb-4 border-b border-slate-200">Payment Gateways</h2>

        <div className="space-y-3">
          {gateways.map((gateway) => (
            <div key={gateway.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={gateway.isActive} readOnly className="rounded" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{gateway.gatewayName}</p>
                  <p className="text-xs text-slate-500">Status: {gateway.status}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gateway.status)}`}>
                {gateway.status}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 pt-2">Gateway status is monitored automatically. Contact support for configuration changes.</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 pb-4 border-b border-slate-200">Change Admin Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        <p className="text-sm text-red-700">Irreversible actions - use with caution</p>

        <div className="space-y-2">
          <button className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50">
            Clear Cache
          </button>
          <button className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50">
            Reset Statistics
          </button>
        </div>
      </div>
    </div>
  );
}
