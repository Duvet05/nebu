import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTACT } from '~/config/constants';

interface ErrorLayoutProps {
  children: ReactNode;
}

export function ErrorLayout({ children }: ErrorLayoutProps) {
  return (
    <div className="min-h-screen bg-nebu-bg relative flex items-center justify-center px-4">
      {/* Background Effects */}
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
        <svg className="w-14 h-14 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 md:p-12 text-center transition-all duration-300">
      {/* Error icon */}
      <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center border-4 ${getIconBackground()}`}>
        {getErrorIcon()}
      </div>
      
      {/* Error code */}
      <div className="text-7xl md:text-8xl font-bold font-gochi text-primary mb-4 animate__animated animate__fadeIn">{statusCode}</div>
      
      {/* Error message */}
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-3">
        {getErrorTitle()}
        <img src="/assets/logos/logo-nebu.svg" alt="Nebu" className="h-8 md:h-10 transition-all" />
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
      <div className="flex flex-col sm:flex-row gap-6 justify-center mb-6">
        <a
          href="/"
          className="relative inline-flex items-center justify-center gap-3 font-gochi font-semibold text-lg px-10 py-5 rounded-full min-w-[200px] bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 ease-out"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {t('errors.goHome')}
        </a>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-semibold hover:border-primary hover:text-primary transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('errors.back')}
        </button>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.05]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <details className="mb-8 text-left bg-gray-50 rounded-xl p-6 border border-gray-200">
      <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
        {t('errors.technicalDetails')}
      </summary>
      <div className="mt-3 space-y-3">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <p className="text-xs font-mono text-gray-800">
            <span className="font-semibold text-gray-900">{t('errors.message')}:</span>
            <br />
            {errorMessage}
          </p>
        </div>
        {errorStack && (
          <div className="p-6 bg-white rounded-lg border border-gray-200 max-h-64 overflow-auto">
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

export default ErrorLayout;
