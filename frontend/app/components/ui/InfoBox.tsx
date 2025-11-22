/**
 * InfoBox Component
 *
 * Componente de caja informativa reutilizable para mensajes, alertas y notificaciones.
 * Soporta diferentes variantes visuales y íconos personalizados.
 *
 * @example
 * <InfoBox variant="info" title="Información importante">
 *   Este es un mensaje informativo.
 * </InfoBox>
 *
 * @example
 * <InfoBox variant="success" icon={<CheckIcon />}>
 *   Operación completada exitosamente.
 * </InfoBox>
 */

import { type ReactNode, memo } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  type LucideIcon
} from 'lucide-react';

export interface InfoBoxProps {
  /** Variante visual del InfoBox */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Título opcional del InfoBox */
  title?: string;
  /** Contenido del InfoBox */
  children: ReactNode;
  /** Ícono personalizado (sobrescribe el ícono por defecto) */
  icon?: ReactNode;
  /** Mostrar ícono por defecto basado en la variante */
  showIcon?: boolean;
  /** Tamaño del InfoBox */
  size?: 'sm' | 'md' | 'lg';
  /** Clases adicionales */
  className?: string;
  /** Callback cuando se cierra el InfoBox (habilita botón de cierre) */
  onClose?: () => void;
}

// Mapeo de íconos por defecto para cada variante
const variantIcons: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export const InfoBox = memo(function InfoBox({
  variant = 'info',
  title,
  children,
  icon,
  showIcon = true,
  size = 'md',
  className,
  onClose,
}: InfoBoxProps) {
  const { t } = useTranslation('common');

  // Configuración de variantes
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      title: 'text-blue-900',
      content: 'text-blue-800',
      icon: 'text-blue-500',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      title: 'text-green-900',
      content: 'text-green-800',
      icon: 'text-green-500',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      title: 'text-yellow-900',
      content: 'text-yellow-800',
      icon: 'text-yellow-500',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      title: 'text-red-900',
      content: 'text-red-800',
      icon: 'text-red-500',
    },
  };

  // Configuración de tamaños
  const sizeStyles = {
    sm: 'p-4 gap-2',
    md: 'p-6 gap-3',
    lg: 'p-8 gap-4',
  };

  const textSizes = {
    sm: {
      title: 'text-sm',
      content: 'text-sm',
    },
    md: {
      title: 'text-base',
      content: 'text-sm',
    },
    lg: {
      title: 'text-lg',
      content: 'text-base',
    },
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const styles = variantStyles[variant];
  const DefaultIcon = variantIcons[variant];

  return (
    <div
      className={clsx(
        'border rounded-xl',
        styles.container,
        sizeStyles[size],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Ícono */}
        {showIcon && (
          <div className={clsx('flex-shrink-0', styles.icon)}>
            {icon || <DefaultIcon className={iconSizes[size]} />}
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3
              className={clsx(
                'font-semibold mb-2',
                styles.title,
                textSizes[size].title
              )}
            >
              {title}
            </h3>
          )}
          <div
            className={clsx(
              'leading-relaxed',
              styles.content,
              textSizes[size].content
            )}
          >
            {children}
          </div>
        </div>

        {/* Botón de cierre */}
        {onClose && (
          <button
            onClick={onClose}
            className={clsx(
              'flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-black/5',
              styles.icon
            )}
            aria-label={t('common.close', 'Cerrar')}
            type="button"
          >
            <X className={iconSizes[size]} />
          </button>
        )}
      </div>
    </div>
  );
});

// Variantes predefinidas para casos comunes
export const InfoBoxInfo = memo(function InfoBoxInfo(
  props: Omit<InfoBoxProps, 'variant'>
) {
  return <InfoBox {...props} variant="info" />;
});

export const InfoBoxSuccess = memo(function InfoBoxSuccess(
  props: Omit<InfoBoxProps, 'variant'>
) {
  return <InfoBox {...props} variant="success" />;
});

export const InfoBoxWarning = memo(function InfoBoxWarning(
  props: Omit<InfoBoxProps, 'variant'>
) {
  return <InfoBox {...props} variant="warning" />;
});

export const InfoBoxError = memo(function InfoBoxError(
  props: Omit<InfoBoxProps, 'variant'>
) {
  return <InfoBox {...props} variant="error" />;
});

export default InfoBox;
