'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Separate component that uses useSearchParams
function ResetPasswordForm() {
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
      setError('Invalid reset link. Please request a new one.');
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
      const response = await fetch(`${API_URL}/api/auth/reset-password/`, {
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
        setError(data.message || 'Failed to reset password. Link may have expired.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-navy py-12 px-4">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-success)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-300">Enter your new password below</p>
        </div>

        {/* Form Card */}
        <div className="card-lg animate-fadeIn">

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(43, 196, 138, 0.1)', borderLeft: '4px solid var(--color-success)' }}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" style={{ color: 'var(--color-success)' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold" style={{ color: 'var(--color-success-dark)' }}>
                  Password reset successful!
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Redirecting to login page...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50"
              style={{ borderLeft: '4px solid var(--color-danger)' }}>
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--color-navy)' }}>
                New Password
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                placeholder="Enter new password"
                className="input"
                required
                disabled={loading || success}
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--color-navy)' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Confirm new password"
                className="input"
                required
                disabled={loading || success}
                minLength={8}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || success || !token}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner w-5 h-5 mr-2"></div>
                  Resetting...
                </span>
              ) : success ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Password Reset!
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <a href="/login" className="link font-semibold">
                Back to login
              </a>
            </p>
          </div>

        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-white/60 text-sm animate-fadeIn">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your password is encrypted and secure</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-navy">
      <div className="text-center">
        <div className="spinner w-12 h-12 mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
}

// Main export wrapped in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}