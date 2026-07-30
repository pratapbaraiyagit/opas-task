import React from 'react';

import { cn } from '@utils/index';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantClasses = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
};

const sizeClasses = {
  sm: 'text-2xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className,
}) => {
  return (
    <span className={cn(variantClasses[variant], sizeClasses[size], className)}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'primary' && 'bg-primary-500',
            variant === 'neutral' && 'bg-surface-400',
          )}
        />
      )}
      {children}
    </span>
  );
};
