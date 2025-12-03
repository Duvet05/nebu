// app/components/ErrorLayout.tsx
// Layout mejorado para manejo de errores con diseño consistente

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTACT } from '~/config/constants';

interface ErrorLayoutProps {
  children: ReactNode;
}

export function ErrorLayout({ children }: ErrorLayoutProps) {
  return (
    <div className="min-h-screen bg-nebu-bg relative flex items-center justify-center px-4">
      {/* Background Effects - Subtle and consistent */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #6366f115 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, #6366f110 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 90px 90px',
          backgroundPosition: '0 0, 40px 40px'
        }}></div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface ErrorContentProps {
  error: Error | any;
  statusCode?: number;
  title?: string;
  description?: string;
  showDetails?: boolean;
  onRetry?: () => void;
}

export function ErrorContent({ 
  error, 
  statusCode = 500,
  title,
  description,
  showDetails = process.env.NODE_ENV === 'development',
  onRetry 
}: ErrorContentProps) {
  const { t } = useTranslation('common');
  
  const getErrorIcon = () => {
    if (statusCode === 404) {
      return (
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  };
  
  const getIconBackground = () => {
    if (statusCode === 404) return 'bg-primary/10 border-primary/20';
    return 'bg-red-50 border-red-100';
  };
  
  const getErrorTitle = () => {
    if (title) return title;
    
    switch (statusCode) {
      case 404:
        return t('errors.404.title');
      case 401:
        return t('errors.401.title');
      case 403:
        return t('errors.403.title');
      case 500:
        return t('errors.500.title');
      default:
        return t('errors.default.title');
    }
  };
  
  const getErrorDescription = () => {
    if (description) return description;
    
    switch (statusCode) {
      case 404:
        return t('errors.404.description');
      case 401:
        return t('errors.401.description');
      case 403:
        return t('errors.403.description');
      case 500:
        return t('errors.500.description');
      default:
        return t('errors.default.description');
    }
  };
  
  return (
    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 text-center">
      {/* Error icon */}
      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center border-2 ${getIconBackground()}`}>
        {getErrorIcon()}
      </div>
      
      {/* Error code */}
      <div className="text-7xl md:text-8xl font-bold font-gochi text-primary mb-4">{statusCode}</div>
      
      {/* Error message with Nebu logo */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
        {getErrorTitle()}
        <img src="/assets/logos/logo-nebu.svg" alt="Nebu" className="h-8 md:h-10" />
      </h1>
      
      {/* Error description */}
      <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
        {getErrorDescription()}
      </p>
      
      {/* Error details for development */}
      {showDetails && error && (
        <ErrorDetails error={error} />
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <a
          href="/"
          className="relative inline-flex items-center justify-center gap-2 font-gochi font-bold text-base px-8 py-4 rounded-full min-w-[200px] md:min-w-[240px] bg-primary text-white shadow-[0_6px_20px_rgba(255,181,74,0.3)] hover:shadow-[0_10px_30px_rgba(255,181,74,0.45)] transition-all duration-200 ease-out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t('errors.goHome')}
        </a>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-semibold hover:border-primary hover:text-primary transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('errors.back')}
        </button>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('errors.retry')}
          </button>
        )}
      </div>
      
      {/* Support link */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {t('errors.needHelp')} {' '}
          <a href={`mailto:${CONTACT.email.support}`} className="text-primary font-semibold hover:underline transition-colors">
            {t('errors.contactSupport')}
          </a>
        </p>
      </div>
    </div>
  );
}

function ErrorDetails({ error }: { error: Error | any }) {
  const { t } = useTranslation('common');
  const errorMessage = error?.message || 'Error desconocido';
  const errorStack = error?.stack || '';
  
  return (
    <details className="mb-8 text-left bg-gray-50 rounded-xl p-4 border border-gray-200">
      <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
        {t('errors.technicalDetails')}
      </summary>
      <div className="mt-3 space-y-3">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-xs font-mono text-gray-800">
            <span className="font-semibold text-gray-900">{t('errors.message')}:</span>
            <br />
            {errorMessage}
          </p>
        </div>
        {errorStack && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 max-h-64 overflow-auto">
            <p className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">
              <span className="font-semibold text-gray-900">{t('errors.stackTrace')}:</span>
              {'\n'}
              {errorStack}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

// Error boundary fallback component
export function ErrorBoundaryFallback({ error, resetErrorBoundary }: any) {
  return (
    <ErrorLayout>
      <ErrorContent 
        error={error}
        onRetry={resetErrorBoundary}
        showDetails
      />
    </ErrorLayout>
  );
}

// 404 Not Found component
export function NotFound() {
  const { t } = useTranslation('common');
  return (
    <ErrorLayout>
      <ErrorContent 
        error={null}
        statusCode={404}
        title={t('errors.notFound.title')}
        description={t('errors.notFound.description')}
      />
    </ErrorLayout>
  );
}

// Maintenance component
export function Maintenance() {
  const { t } = useTranslation('common');
  return (
    <ErrorLayout>
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 border-2 border-accent/20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold font-gochi text-primary mb-4 flex items-center justify-center gap-3">
          {t('errors.maintenance.title')}
          <img src="/assets/logos/logo-nebu.svg" alt="Nebu" className="h-8 md:h-10" />
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
          {t('errors.maintenance.description')}
        </p>
        
        <div className="bg-accent/10 border border-accent/20 p-6 rounded-xl mb-8">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">{t('errors.maintenance.estimatedTime')}</span> <strong className="text-accent">30 minutos</strong>
          </p>
        </div>
        
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {t('errors.maintenance.followUs')} {' '}
            <a href="https://twitter.com/flowtelligence" className="text-primary font-semibold hover:underline transition-colors">
              Twitter
            </a>
            {' '} {t('errors.maintenance.forUpdates')}
          </p>
        </div>
      </div>
    </ErrorLayout>
  );
}

export default ErrorLayout;