import React from 'react';
import { DevelopmentStatus } from '../types';

interface StatusBadgeProps {
  status: DevelopmentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Development Started':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'In Progress':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          dot: 'bg-sky-400 animate-ping',
        };
      case 'Alpha Build Ready':
        return {
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
        };
      case 'Testing & QA':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'Ready for Launch':
        return {
          bg: 'bg-teal-500/10 text-teal-300 border-teal-500/40 shadow-sm',
          dot: 'bg-teal-400 animate-pulse',
        };
      case 'Completed':
        return {
          bg: 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold',
          dot: 'bg-emerald-600',
        };
      case 'On Hold':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
        };
      case 'Requirements Approved':
        return {
          bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          dot: 'bg-blue-400',
        };
      case 'Planning':
      default:
        return {
          bg: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80',
          dot: 'bg-zinc-400',
        };
    }
  };

  const { bg, dot } = getStyles();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 space-x-1.5',
    md: 'text-xs px-2.5 py-1 space-x-2',
    lg: 'text-sm px-3.5 py-1.5 space-x-2.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses} tracking-tight font-medium select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </span>
  );
};
