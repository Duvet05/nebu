// app/components/ErrorLayout.tsx
// Layout mejorado para manejo de errores

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorLayoutProps {
  children: ReactNode;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorLayout({ children, variant = 'error' }: ErrorLayoutProps) {
  const backgroundColors = {
    error: 'from-red-50 to-pink-100',
    warning: 'from-yellow-50 to-orange-100',
    info: 'from-blue-50 to-indigo-100'
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundColors[variant]} flex items-center justify-center px-4`}>
      {children}
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
        <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
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
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      {/* Error icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        {getErrorIcon()}
      </div>
      
      {/* Error code */}
      <div className="text-6xl font-bold text-gray-800 mb-2">{statusCode}</div>
      
      {/* Error message */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-4">
        {getErrorTitle()}
      </h1>
      
      {/* Error description */}
      <p className="text-gray-600 mb-6">
        {getErrorDescription()}
      </p>
      
      {/* Error details for development */}
      {showDetails && error && (
        <ErrorDetails error={error} />
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {t('errors.back')}
        </button>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('errors.retry')}
          </button>
        )}
        
        <a
          href="/"
          className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all"
        >
          {t('errors.goHome')}
        </a>
      </div>
      
      {/* Support link */}
      <p className="mt-6 text-sm text-gray-500">
        {t('errors.needHelp')} {' '}
        <a href="mailto:soporte@flow-telligence.com" className="text-primary hover:underline">
          {t('errors.contactSupport')}
        </a>
      </p>
    </div>
  );
}

function ErrorDetails({ error }: { error: Error | any }) {
  const { t } = useTranslation('common');
  const errorMessage = error?.message || 'Error desconocido';
  const errorStack = error?.stack || '';
  
  return (
    <details className="mb-6 text-left">
      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
        {t('errors.technicalDetails')}
      </summary>
      <div className="mt-2 space-y-2">
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-xs font-mono text-gray-700">
            <span className="font-semibold">{t('errors.message')}</span> {errorMessage}
          </p>
        </div>
        {errorStack && (
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">
              <span className="font-semibold">{t('errors.stackTrace')}</span>
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
    <ErrorLayout variant="error">
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
    <ErrorLayout variant="warning">
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
    <ErrorLayout variant="info">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">
          {t('errors.maintenance.title')}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t('errors.maintenance.description')}
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            {t('errors.maintenance.estimatedTime')} <strong>30 minutos</strong>
          </p>
        </div>
        
        <p className="text-sm text-gray-500">
          {t('errors.maintenance.followUs')} {' '}
          <a href="https://twitter.com/flowtelligence" className="text-blue-600 hover:underline">
            Twitter
          </a>
          {' '} {t('errors.maintenance.forUpdates')}
        </p>
      </div>
    </ErrorLayout>
  );
}

export default ErrorLayout;