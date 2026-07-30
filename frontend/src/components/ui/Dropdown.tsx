import React, { useState, useRef, useEffect } from 'react';

import { cn } from '@utils/index';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: (DropdownItem | 'divider')[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-56 glass-card p-1.5 animate-scale-in origin-top',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, index) => {
            if (item === 'divider') {
              return <div key={index} className="divider my-1.5" />;
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                  item.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700',
                  item.disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
