import React from 'react';

import { cn, getInitials, generateColor } from '@utils/index';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
  showStatus = false,
  isOnline = false,
}) => {
  const color = generateColor(name);
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover ring-2 ring-white dark:ring-surface-800',
            sizeClasses[size],
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-surface-800',
            sizeClasses[size],
          )}
          style={{ backgroundColor: color }}
          title={name}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-surface-800',
            statusSizeClasses[size],
            isOnline ? 'bg-emerald-500' : 'bg-surface-400',
          )}
        />
      )}
    </div>
  );
};

// Avatar group for showing multiple users
interface AvatarGroupProps {
  users: Array<{ name: string; src?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = 'sm',
}) => {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayed.map((user, index) => (
        <Avatar
          key={index}
          name={user.name}
          src={user.src}
          size={size}
          className="hover:z-10 transition-transform hover:scale-110"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-medium bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 ring-2 ring-white dark:ring-surface-800',
            sizeClasses[size],
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
