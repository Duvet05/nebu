import { useState, useEffect, useCallback } from 'react';

interface CulqiTokenResponse {
  id: string;
  object: string;
  email: string;
}

interface CulqiError {
  merchant_message: string;
  user_message: string;
}

interface CulqiSettings {
  title: string;
  currency: string;
  amount: number;
  description?: string;
}

declare global {
  var Culqi: any;
  var CULQI_PUBLIC_KEY: string;
  var culqi: () => void;
}

/**
 * Hook para integración con Culqi
 * 
 * Basado en la documentación oficial:
 * https://docs.culqi.com/#/desarrollo/pagos/checkout
 */
export function useCulqi() {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si Culqi está cargado
    const checkCulqi = setInterval(() => {
      if (typeof window !== 'undefined' && window.Culqi) {
        setIsReady(true);
        clearInterval(checkCulqi);
      }
    }, 100);

    // Timeout después de 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkCulqi);
      if (!isReady) {
        setError('No se pudo cargar el sistema de pagos');
      }
    }, 10000);

    return () => {
      clearInterval(checkCulqi);
      clearTimeout(timeout);
    };
  }, [isReady]);

  /**
   * Abrir modal de pago de Culqi
   * 
   * @param settings Configuración del pago (título, monto, orden)
   * @param onToken Callback cuando se genera el token exitosamente
   * @param onError Callback cuando hay un error
   */
  const openCheckout = useCallback((
    settings: CulqiSettings,
    onToken: (token: CulqiTokenResponse) => void,
    onError?: (error: CulqiError) => void
  ) => {
    if (!isReady || !window.Culqi) {
      setError('Sistema de pagos no disponible');
      return;
    }

    // Configurar Culqi
    window.Culqi.publicKey = window.CULQI_PUBLIC_KEY;
    window.Culqi.settings({
      title: settings.title,
      currency: settings.currency,
      amount: settings.amount, // Monto en centavos
      description: settings.description,
    });

    // Configurar callbacks
    window.Culqi.options({
      lang: 'es',
      modal: true,
      style: {
        logo: 'https://flow-telligence.com/assets/logos/logo-nebu.svg',
        bannerColor: '#6366f1',
        buttonBackground: '#6366f1',
        menuColor: '#6366f1',
      }
    });

    // Handler para token exitoso
    window.culqi = function() {
      if (window.Culqi.token) {
        const token = window.Culqi.token;
        setIsProcessing(true);
        onToken(token);
      } else if (window.Culqi.error) {
        const culqiError = window.Culqi.error;
        setError(culqiError.user_message);
        if (onError) {
          onError(culqiError);
        }
      }
    };

    // Abrir modal
    window.Culqi.open();
  }, [isReady]);

  /**
   * Cerrar modal de Culqi
   */
  const closeCheckout = useCallback(() => {
    if (window.Culqi) {
      window.Culqi.close();
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset del estado de procesamiento
   */
  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
  }, []);

  return {
    isReady,
    isProcessing,
    error,
    openCheckout,
    closeCheckout,
    clearError,
    resetProcessing,
  };
}
