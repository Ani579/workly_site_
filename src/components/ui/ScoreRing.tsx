import * as React from 'react';
import { cn } from './Button';
import { motion } from 'framer-motion';

interface ScoreRingProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 120, strokeWidth = 10, className, ...props }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (safeScore / 100) * circumference;

  // Determine color based on score
  const color = safeScore >= 80 ? 'var(--color-success-green)' : safeScore >= 50 ? 'var(--color-primary-blue)' : '#f59e0b'; // amber

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }} {...props}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-[var(--color-dark-navy)]">
        <span className="text-3xl font-bold">{safeScore}</span>
      </div>
    </div>
  );
}

