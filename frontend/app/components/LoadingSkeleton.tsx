// app/components/LoadingSkeleton.tsx
// Skeleton UI para mejorar la experiencia durante la carga

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo skeleton */}
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
            
            {/* Navigation skeleton */}
            <div className="hidden md:flex space-x-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            
            {/* Button skeleton */}
            <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>
      
      {/* Hero Section Skeleton */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text content skeleton */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-full h-8 bg-gray-200 rounded animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-5/6 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-4/6 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              
              <div className="flex space-x-4">
                <div className="w-32 h-12 bg-purple-200 rounded-lg animate-pulse" />
                <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            
            {/* Image skeleton */}
            <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </section>
      
      {/* Features Section Skeleton */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-48 h-8 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="w-96 h-4 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl">
                <div className="w-12 h-12 bg-purple-200 rounded-lg mb-4 animate-pulse" />
                <div className="w-3/4 h-6 bg-gray-200 rounded mb-3 animate-pulse" />
                <div className="space-y-2">
                  <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-5/6 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Floating elements */}
      <div className="fixed bottom-4 right-4 w-14 h-14 bg-green-400 rounded-full animate-pulse" />
      
      {/* Cart sidebar skeleton (initially hidden) */}
      <div className="hidden">
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl" />
      </div>
    </div>
  );
}

// Loading spinner component for smaller loading states
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-primary/20 rounded-full animate-spin border-t-primary`} />
    </div>
  );
}

// Progress bar component for loading states
export function ProgressBar({ progress = 60 }: { progress?: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Skeleton text component
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${100 - (i * 15)}%` }}
        />
      ))}
    </div>
  );
}

// Skeleton card component
export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      <div className="w-3/4 h-6 bg-gray-200 rounded mb-3 animate-pulse" />
      <SkeletonText lines={2} />
      <div className="mt-4 flex justify-between items-center">
        <div className="w-20 h-8 bg-purple-200 rounded animate-pulse" />
        <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;