import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

import { Input, Button } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { loginSchema, LoginFormData } from './authSchemas';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    try {
      await login(data);
      toast.success('Successfully logged in');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Failed to login'
        : 'Failed to login';
      setServerError(message);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Welcome back</h2>
        <p className="text-surface-500 mt-2">Please enter your details to sign in.</p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-surface-600 dark:text-surface-400">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500 font-medium">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-surface-600 dark:text-surface-400 mt-8">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-600 hover:text-primary-500 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
};
