'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import Image from 'next/image';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.emailVerified) {
        router.push('/profile-setup');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!user || resendCooldown > 0) return;

    try {
      await sendEmailVerification(user);
      setResendCooldown(60); // 60 seconds cooldown
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    }
  };

  const handleRefresh = () => {
    if (user) {
      user.reload().then(() => {
        if (user.emailVerified) {
          router.push('/profile-setup');
        }
      });
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Code Rush Logo"
              width={64}
              height={64}
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify your email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We've sent a verification email to{' '}
            <span className="font-medium text-purple-600">{user.email}</span>
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              I've verified my email
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {resendCooldown > 0
                ? `Resend email (${resendCooldown}s)`
                : 'Resend verification email'}
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the email? Check your spam folder or try resending the verification email.
          </p>
        </div>
      </div>
    </div>
  );
} 