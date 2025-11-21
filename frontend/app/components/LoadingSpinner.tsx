// app/components/LoadingSpinner.tsx
// Enhanced loading spinner component with multiple variants

import { memo } from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'white' | 'dots' | 'pulse';
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  variant = 'default',
  message,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  const borderSizes = {
    xs: 'border-2',
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-4',
  };
  
  const colorClasses = {
    default: 'border-gray-200 border-t-gray-600',
    primary: 'border-primary/20 border-t-primary',
    white: 'border-white/20 border-t-white',
    dots: '',
    pulse: '',
  };
  
  const messageSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  
  const SpinnerContent = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={size} />;
      case 'pulse':
        return <PulseSpinner size={size} />;
      default:
        return (
          <div
            className={clsx(
              sizeClasses[size],
              borderSizes[size],
              colorClasses[variant],
              'rounded-full animate-spin',
              className
            )}
          />
        );
    }
  };
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerContent />
          {message && (
            <p className={clsx(messageSizes[size], 'text-gray-700 animate-pulse')}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <SpinnerContent />
      {message && (
        <p className={clsx(messageSizes[size], 'text-gray-700 animate-pulse')}>
          {message}
        </p>
      )}
    </div>
  );
});

// Dots variant spinner
function DotsSpinner({ size }: { size: string }) {
  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };
  
  const gapSizes = {
    xs: 'gap-1',
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-3',
    xl: 'gap-4',
  };
  
  return (
    <div className={clsx('flex items-center', gapSizes[size as keyof typeof gapSizes])}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            dotSizes[size as keyof typeof dotSizes],
            'bg-primary rounded-full animate-bounce'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Pulse variant spinner
function PulseSpinner({ size }: { size: string }) {
  const pulseSizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };
  
  return (
    <div className="relative">
      <div className={clsx(
        pulseSizes[size as keyof typeof pulseSizes],
        'bg-primary rounded-full animate-ping absolute'
      )} />
      <div className={clsx(
        pulseSizes[size as keyof typeof pulseSizes],
        'bg-primary rounded-full relative'
      )} />
    </div>
  );
}

// Loading overlay component
export const LoadingOverlay = memo(function LoadingOverlay({
  isLoading,
  message = 'Cargando...',
  blur = true,
}: {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
}) {
  if (!isLoading) return null;
  
  return (
    <div className={clsx(
      'absolute inset-0 z-50 flex items-center justify-center',
      blur ? 'bg-white/60 backdrop-blur-sm' : 'bg-white/90'
    )}>
      <LoadingSpinner size="lg" variant="primary" message={message} />
    </div>
  );
});

// Inline loading component
export const InlineLoading = memo(function InlineLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <span className={clsx('inline-flex items-center gap-2', className)}>
      <LoadingSpinner size="xs" variant="default" />
      <span className="text-sm text-gray-600">Cargando...</span>
    </span>
  );
});

// Button loading state
export const ButtonLoading = memo(function ButtonLoading({
  isLoading,
  children,
  loadingText = 'Procesando...',
  className,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}) {
  if (isLoading) {
    return (
      <span className={clsx('inline-flex items-center gap-2', className)}>
        <LoadingSpinner size="sm" variant="white" />
        <span>{loadingText}</span>
      </span>
    );
  }
  
  return <>{children}</>;
});

export default LoadingSpinner;