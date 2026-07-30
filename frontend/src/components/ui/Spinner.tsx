import React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@utils/index';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  label,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary-500', sizeClasses[size])} />
      {label && (
        <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse-soft">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};
