import React from 'react';
import { FileX2 } from 'lucide-react';

import { cn } from '@utils/index';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        {icon || <FileX2 className="w-8 h-8 text-surface-400" />}
      </div>
      <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
