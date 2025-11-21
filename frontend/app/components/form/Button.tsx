/**
 * Button Component
 * 
 * Componente de botón reutilizable con soporte para:
 * - Múltiples variantes y tamaños
 * - Estados de carga
 * - Íconos (izquierda/derecha)
 * - Full accessibility
 * - Animaciones suaves
 * 
 * @example
 * <Button
 *   variant="primary"
 *   size="lg"
 *   loading={isSubmitting}
 *   leftIcon={<Send />}
 *   onClick={handleSubmit}
 * >
 *   Enviar
 * </Button>
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Variantes de color
    const variantClasses = {
      primary: 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'text-primary hover:bg-primary/10 active:bg-primary/20',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    };

    // Tamaños
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-6 py-4 text-lg rounded-xl',
      xl: 'px-8 py-5 text-xl rounded-2xl',
    };

    // Tamaño del spinner según el tamaño del botón
    const spinnerSize = size === 'sm' ? 'sm' : 'sm';

    // Determinar si el botón está deshabilitado
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-semibold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <LoadingSpinner size={spinnerSize} message="" className="!mb-0" />
        )}

        {/* Left Icon (oculto durante loading) */}
        {!loading && leftIcon && (
          <span className="inline-flex items-center">{leftIcon}</span>
        )}

        {/* Children */}
        {children}

        {/* Right Icon (oculto durante loading) */}
        {!loading && rightIcon && (
          <span className="inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
