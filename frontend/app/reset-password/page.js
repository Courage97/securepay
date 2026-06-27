'use client';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('${API_URL}/api/auth/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: formData.new_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-navy py-12 px-4">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-success)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-300">Enter your new password</p>
        </div>

        <div className="card-lg animate-fadeIn">
          
          {success && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(43, 196, 138, 0.1)', borderLeft: '4px solid var(--color-success)' }}>
              <p className="font-semibold" style={{ color: 'var(--color-success-dark)' }}>
                Password reset successful!
              </p>
              <p className="text-sm text-gray-600 mt-2">Redirecting to login...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50" style={{ borderLeft: '4px solid var(--color-danger)' }}>
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-navy)' }}>
                New Password
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                placeholder="Enter new password"
                className="input"
                required
                disabled={loading || success}
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-navy)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                placeholder="Confirm new password"
                className="input"
                required
                disabled={loading || success}
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || success}
            >
              {loading ? 'Resetting...' : success ? 'Success!' : 'Reset Password'}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
