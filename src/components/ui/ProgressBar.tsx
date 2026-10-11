import * as React from 'react';
import { cn } from './Button';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function ProgressBar({ value, indicatorColor = 'bg-[var(--color-primary-blue)]', className, ...props }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-gray-200', className)}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 transition-all duration-500', indicatorColor)}
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </div>
  );
}

