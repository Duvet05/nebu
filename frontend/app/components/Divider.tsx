// app/components/Divider.tsx
// Componente de línea separadora reutilizable

import { memo } from 'react';
import clsx from 'clsx';

interface DividerProps {
  /** Orientación de la línea */
  orientation?: 'horizontal' | 'vertical';
  /** Variante de estilo */
  variant?: 'solid' | 'dashed' | 'dotted' | 'gradient';
  /** Grosor de la línea */
  thickness?: 'thin' | 'medium' | 'thick';
  /** Color de la línea */
  color?: 'gray' | 'primary' | 'accent' | 'white' | 'black';
  /** Espaciado alrededor (margin) */
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Opacidad de la línea */
  opacity?: number;
  /** Clases adicionales */
  className?: string;
  /** Texto opcional en el centro (solo horizontal) */
  label?: string;
  /** Posición del label */
  labelPosition?: 'left' | 'center' | 'right';
}

export const Divider = memo(function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  color = 'gray',
  spacing = 'md',
  opacity = 0.2,
  className,
  label,
  labelPosition = 'center',
}: DividerProps) {
  // Clases de grosor
  const thicknessClasses = {
    horizontal: {
      thin: 'h-px',
      medium: 'h-0.5',
      thick: 'h-1',
    },
    vertical: {
      thin: 'w-px',
      medium: 'w-0.5',
      thick: 'w-1',
    },
  };

  // Clases de color
  const colorClasses = {
    gray: 'bg-gray-300',
    primary: 'bg-purple-400',
    accent: 'bg-indigo-400',
    white: 'bg-white',
    black: 'bg-black',
  };

  // Clases de espaciado
  const spacingClasses = {
    horizontal: {
      none: '',
      xs: 'my-2',
      sm: 'my-4',
      md: 'my-6',
      lg: 'my-8',
      xl: 'my-12',
    },
    vertical: {
      none: '',
      xs: 'mx-2',
      sm: 'mx-4',
      md: 'mx-6',
      lg: 'mx-8',
      xl: 'mx-12',
    },
  };

  // Clases de variante
  const variantClasses = {
    solid: '',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    gradient: 'bg-gradient-to-r from-transparent via-current to-transparent',
  };

  // Si hay label, renderizar con texto
  if (label && orientation === 'horizontal') {
    return (
      <div
        className={clsx(
          'flex items-center',
          spacingClasses.horizontal[spacing],
          className
        )}
        role="separator"
        aria-label={label}
      >
        {labelPosition !== 'left' && (
          <div
            className={clsx(
              'flex-1',
              thicknessClasses.horizontal[thickness],
              variant === 'gradient' ? 'bg-gradient-to-r from-transparent via-gray-300 to-gray-300' : colorClasses[color],
              variant !== 'solid' && variant !== 'gradient' && `border-t ${variantClasses[variant]}`
            )}
            style={{ opacity }}
          />
        )}
        <span
          className={clsx(
            'px-4 text-sm font-medium text-gray-600',
            labelPosition === 'left' && 'pr-4 pl-0',
            labelPosition === 'right' && 'pl-4 pr-0'
          )}
        >
          {label}
        </span>
        {labelPosition !== 'right' && (
          <div
            className={clsx(
              'flex-1',
              thicknessClasses.horizontal[thickness],
              variant === 'gradient' ? 'bg-gradient-to-r from-gray-300 via-gray-300 to-transparent' : colorClasses[color],
              variant !== 'solid' && variant !== 'gradient' && `border-t ${variantClasses[variant]}`
            )}
            style={{ opacity }}
          />
        )}
      </div>
    );
  }

  // Divider simple sin label
  const baseClasses = clsx(
    orientation === 'horizontal' ? 'w-full' : 'h-full',
    thicknessClasses[orientation][thickness],
    variant === 'gradient' 
      ? orientation === 'horizontal'
        ? 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
        : 'bg-gradient-to-b from-transparent via-gray-300 to-transparent'
      : colorClasses[color],
    spacingClasses[orientation][spacing],
    className
  );

  if (variant === 'dashed' || variant === 'dotted') {
    return (
      <div
        className={clsx(
          orientation === 'horizontal' ? 'w-full' : 'h-full',
          spacingClasses[orientation][spacing],
          className
        )}
        role="separator"
      >
        <div
          className={clsx(
            orientation === 'horizontal' ? 'w-full border-t' : 'h-full border-l',
            variantClasses[variant],
            `border-${color === 'gray' ? 'gray-300' : color === 'primary' ? 'purple-400' : color === 'accent' ? 'indigo-400' : color}`
          )}
          style={{ opacity }}
        />
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={{ opacity }}
      role="separator"
    />
  );
});

// Variantes pre-configuradas para casos comunes
export const SectionDivider = memo(function SectionDivider({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <Divider 
      variant="gradient"
      spacing="lg"
      thickness="thin"
      className={className}
    />
  );
});

export const ContentDivider = memo(function ContentDivider({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <Divider 
      color="gray"
      spacing="md"
      thickness="thin"
      opacity={0.15}
      className={className}
    />
  );
});

export const VerticalDivider = memo(function VerticalDivider({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <Divider 
      orientation="vertical"
      color="gray"
      spacing="sm"
      thickness="thin"
      opacity={0.2}
      className={className}
    />
  );
});

export default Divider;
