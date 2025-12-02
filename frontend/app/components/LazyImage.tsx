/**
 * LazyImage Component
 * 
 * Componente de imagen con lazy loading automático usando Intersection Observer.
 * 
 * Características:
 * - Carga diferida de imágenes para mejor rendimiento
 * - Placeholder mientras se carga
 * - Efecto de fade-in suave
 * - Soporte para blur placeholder
 * - Manejo de errores
 * - Totalmente accesible
 * 
 * @example
 * <LazyImage
 *   src="/images/product.jpg"
 *   alt="Product"
 *   placeholder="/images/product-thumb.jpg"
 *   className="w-full h-auto"
 * />
 */

import { useState, type ImgHTMLAttributes } from 'react';
import { useIntersectionObserver } from '~/hooks/useIntersectionObserver';

export interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  rootMargin?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  blurDataURL,
  rootMargin = '50px',
  threshold = 0.1,
  onLoad,
  onError,
  className = '',
  ...props
}: LazyImageProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin,
    threshold,
    triggerOnce: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ minHeight: '200px' }}
    >
      {/* Blur Placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt="Imagen de carga difuminada"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
        />
      )}

      {/* Placeholder */}
      {placeholder && !isLoaded && !blurDataURL && (
        <img
          src={placeholder}
          alt="Imagen de fondo de carga"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}

      {/* Loading Skeleton */}
      {!isLoaded && !placeholder && !blurDataURL && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Main Image */}
      {isIntersecting && !hasError && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-opacity duration-500
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-12 h-12 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No se pudo cargar la imagen</p>
        </div>
      )}
    </div>
  );
}

/**
 * LazyBackgroundImage Component
 * 
 * Variante para usar como background-image con lazy loading.
 * 
 * @example
 * <LazyBackgroundImage
 *   src="/images/hero-bg.jpg"
 *   className="h-screen"
 * >
 *   <h1>Hero Content</h1>
 * </LazyBackgroundImage>
 */
export interface LazyBackgroundImageProps {
  src: string;
  children?: React.ReactNode;
  placeholder?: string;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function LazyBackgroundImage({
  src,
  children,
  placeholder,
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
  style = {},
}: LazyBackgroundImageProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin,
    threshold,
    triggerOnce: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Precargar imagen cuando sea visible
  if (isIntersecting && !isLoaded) {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }

  const backgroundImage = isLoaded ? src : placeholder || '';

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        ...style,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease-in-out',
      }}
    >
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      {children}
    </div>
  );
}
