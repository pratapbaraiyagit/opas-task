import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@components/ui';
import { authApi } from '@api/auth.api';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link might be expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="w-full text-center py-12">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Verifying Email</h2>
          <p className="text-surface-600 dark:text-surface-400">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center animate-scale-in">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-4">Email Verified!</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-sm">
            {message} You can now access all features of OPAS.
          </p>
          <Link to="/login" className="w-full max-w-xs">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center animate-scale-in">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-4">Verification Failed</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-sm">
            {message}
          </p>
          <Link to="/login" className="w-full max-w-xs">
            <Button variant="secondary" className="w-full">Back to Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
