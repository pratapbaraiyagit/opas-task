import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AuthLayout } from '@layouts/AuthLayout';
import { AppLayout } from '@layouts/AppLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@features/auth/LoginPage';
import { SignupPage } from '@features/auth/SignupPage';
import { ForgotPasswordPage } from '@features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@features/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@features/auth/VerifyEmailPage';

// Placeholder pages — will be replaced with real pages in subsequent phases
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-2xl font-bold text-surface-800 dark:text-surface-200">{title}</h1>
    <p className="text-surface-500 mt-2">Coming in next phase</p>
  </div>
);

const DashboardPage = () => <PlaceholderPage title="Dashboard" />;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password/:token', element: <ResetPasswordPage /> },
      { path: '/verify-email/:token', element: <VerifyEmailPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/starred', element: <PlaceholderPage title="Starred Boards" /> },
          { path: '/members', element: <PlaceholderPage title="Team Members" /> },
          { path: '/settings', element: <PlaceholderPage title="Settings" /> },
          { path: '/board/:boardId', element: <PlaceholderPage title="Board Canvas" /> },
        ],
      },
    ],
  },
]);
