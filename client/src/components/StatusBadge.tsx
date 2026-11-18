import React from 'react';
import type { DevelopmentStatus } from '../types';

interface StatusBadgeProps {
  status: DevelopmentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Development Started':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300/80',
          dot: 'bg-emerald-600 animate-pulse',
        };
      case 'In Progress':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-300/80',
          dot: 'bg-sky-600 animate-ping',
        };
      case 'Alpha Build Ready':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-300/80',
          dot: 'bg-purple-600',
        };
      case 'Testing & QA':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300/80',
          dot: 'bg-amber-600',
        };
      case 'Ready for Launch':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-300/80',
          dot: 'bg-teal-600 animate-pulse',
        };
      case 'Completed':
        return {
          bg: 'bg-zinc-900 text-white border-zinc-900 font-semibold',
          dot: 'bg-emerald-400',
        };
      case 'On Hold':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300/80',
          dot: 'bg-rose-600',
        };
      case 'Requirements Approved':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300/80',
          dot: 'bg-blue-600',
        };
      case 'Planning':
      default:
        return {
          bg: 'bg-zinc-100 text-zinc-700 border-zinc-300',
          dot: 'bg-zinc-500',
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
      className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses} tracking-tight font-medium select-none shadow-sm`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </span>
  );
};
