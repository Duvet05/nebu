// app/components/Logo.tsx
// Logo component with multiple variants and responsive sizing

import { memo } from 'react';
import clsx from 'clsx';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white' | 'black' | 'gradient';
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo = memo(function Logo({ 
  className, 
  variant = 'default',
  showText = true,
  size = 'md'
}: LogoProps) {
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-14',
  };
  
  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };
  
  const colorClasses = {
    default: 'text-purple-600',
    white: 'text-white',
    black: 'text-gray-900',
    gradient: 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent',
  };
  
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {/* Logo Icon */}
      <svg 
        className={clsx(sizeClasses[size], 'w-auto')}
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        
        {/* Logo Path - Replace with your actual logo */}
        <path
          d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 36c-8.837 0-16-7.163-16-16S15.163 8 24 8s16 7.163 16 16-7.163 16-16 16z"
          fill={variant === 'gradient' ? 'url(#logo-gradient)' : 'currentColor'}
          className={variant !== 'gradient' ? colorClasses[variant] : ''}
        />
        <path
          d="M24 14c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 16c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"
          fill={variant === 'gradient' ? 'url(#logo-gradient)' : 'currentColor'}
          className={variant !== 'gradient' ? colorClasses[variant] : ''}
        />
        <circle
          cx="24"
          cy="24"
          r="3"
          fill={variant === 'gradient' ? 'url(#logo-gradient)' : 'currentColor'}
          className={variant !== 'gradient' ? colorClasses[variant] : ''}
        />
      </svg>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={clsx(
            'font-bold tracking-tight',
            textSizeClasses[size],
            colorClasses[variant]
          )}>
            Flow
          </span>
          <span className={clsx(
            'font-light tracking-wide',
            size === 'xs' ? 'text-xs' : 'text-sm',
            variant === 'gradient' ? 'text-gray-600' : 'opacity-70'
          )}>
            Telligence
          </span>
        </div>
      )}
    </div>
  );
});

// Alternative minimalist logo variant
export const LogoMinimal = memo(function LogoMinimal({ 
  className,
  color = 'currentColor'
}: { 
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Flow-Telligence"
    >
      <path
        d="M20 5L35 12.5V27.5L20 35L5 27.5V12.5L20 5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 15L27.5 18.75V26.25L20 30L12.5 26.25V18.75L20 15Z"
        fill={color}
      />
    </svg>
  );
});

// Animated logo variant for loading states
export const LogoAnimated = memo(function LogoAnimated({ 
  className,
  size = 'md'
}: { 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  return (
    <div className={clsx('relative', sizeClasses[size], className)}>
      {/* Spinning ring */}
      <div className="absolute inset-0 border-4 border-purple-200 rounded-full" />
      <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin" />
      
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
      </div>
    </div>
  );
});

export default Logo;