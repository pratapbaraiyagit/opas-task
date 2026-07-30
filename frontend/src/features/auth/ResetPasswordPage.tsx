import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { Input, Button } from '@components/ui';
import { authApi } from '@api/auth.api';
import { resetPasswordSchema, ResetPasswordFormData } from './authSchemas';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid password reset link');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, password: data.password });
      setIsSuccess(true);
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-4">Password reset!</h2>
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          Your password has been reset successfully. You can now log in with your new password.
        </p>
        <Link to="/login">
          <Button className="w-full">Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Reset password</h2>
        <p className="text-surface-500 mt-2">Please enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
          helperText="Must contain at least 8 characters, one uppercase, one lowercase and one number."
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          leftIcon={<Lock className="w-4 h-4" />}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};
