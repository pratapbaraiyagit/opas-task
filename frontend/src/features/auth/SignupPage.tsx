import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

import { Input, Button } from '@components/ui';
import { useAuthStore } from '@store/authStore';
import { signupSchema, SignupFormData } from './authSchemas';

export const SignupPage: React.FC = () => {
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data);
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Create an account</h2>
        <p className="text-surface-500 mt-2">Start collaborating in real-time today.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full Name"
          placeholder="John Doe"
          {...register('name')}
          error={errors.name?.message}
        />

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
          helperText="Must contain at least 8 characters, one uppercase, one lowercase and one number."
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Sign up
        </Button>
      </form>

      <p className="text-center text-sm text-surface-600 dark:text-surface-400 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-500 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
};
