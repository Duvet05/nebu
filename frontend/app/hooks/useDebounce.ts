/**
 * useDebounce Hook
 * 
 * Hook personalizado para debounce de valores.
 * Útil para optimizar búsquedas, llamadas a API y operaciones costosas.
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     // Realizar búsqueda
 *     searchAPI(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * 
 * Beneficios:
 * - Reduce llamadas innecesarias a APIs
 * - Mejora el rendimiento en inputs de búsqueda
 * - Configurable con delay personalizado
 * - Type-safe con TypeScript generics
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar el timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si value cambia (también en cleanup si el componente se desmonta)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo re-ejecutar si value o delay cambian

  return debouncedValue;
}

/**
 * useDebouncedCallback Hook
 * 
 * Variante que devuelve una función debounced en lugar de un valor.
 * Útil cuando necesitas debounce en callbacks o event handlers.
 * 
 * @example
 * const debouncedSave = useDebouncedCallback(
 *   (data) => saveToAPI(data),
 *   1000
 * );
 * 
 * <input onChange={(e) => debouncedSave(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup al desmontar
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args: Parameters<T>) => {
    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Configurar nuevo timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
