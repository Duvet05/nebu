/**
 * Input Component
 * 
 * Componente de input reutilizable con soporte para:
 * - Estados de error y validación
 * - Diferentes variantes de estilo
 * - Íconos personalizados
 * - Labels y mensajes de ayuda
 * - Full accessibility (ARIA)
 * 
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={errors.email}
 *   required
 * />
 */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      fullWidth = false,
      className = '',
      required,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generar ID único consistente entre servidor y cliente
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    // Clases base según variante
    const baseClasses = {
      default: 'border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
      filled: 'bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-primary/20',
      outlined: 'border-2 border-gray-300 focus:border-primary',
    };

    // Clases según tamaño
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    // Clases de error
    const errorClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : '';

    // Clases de disabled
    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed bg-gray-100'
      : '';

    // Padding adicional para íconos
    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg transition-all duration-200
              ${baseClasses[variant]}
              ${sizeClasses[inputSize]}
              ${errorClasses}
              ${disabledClasses}
              ${iconPadding}
              ${className}
            `}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-2 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
