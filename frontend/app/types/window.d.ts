// Global type declarations for window object
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    Culqi?: {
      publicKey: string;
      [key: string]: any;
    };
    CULQI_PUBLIC_KEY?: string;
  }
}

export {};
