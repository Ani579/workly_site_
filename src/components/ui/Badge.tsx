import * as React from 'react';
import { cn } from './Button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'border-transparent bg-[var(--color-primary-blue)] text-white': variant === 'default',
          'border-transparent bg-[var(--color-success-green)] text-white': variant === 'success',
          'text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

