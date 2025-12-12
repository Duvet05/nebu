/**
 * Debounce utility for delaying function execution
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds 
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };
}

/**
 * Creates a debounced function with a promise-based API
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let latestPromise: Promise<ReturnType<T>> | null = null;

  return function debouncedAsync(...args: Parameters<T>): Promise<ReturnType<T>> {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    if (!latestPromise) {
      latestPromise = new Promise((resolve) => {
        timeoutId = setTimeout(async () => {
          const result = await func(...args);
          resolve(result);
          timeoutId = null;
          latestPromise = null;
        }, waitMs);
      });
    }

    return latestPromise;
  };
}

/**
 * Throttle utility - ensures function is called at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastRun >= limitMs) {
      func(...args);
      lastRun = now;
    } else {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(...args);
        lastRun = Date.now();
        timeoutId = null;
      }, limitMs - (now - lastRun));
    }
  };
}
