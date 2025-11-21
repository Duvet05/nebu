// Componente reutilizable de loading
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  message = "Cargando...",
  className = "" 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-8 h-8 border-2",
    md: "w-16 h-16 border-4",
    lg: "w-24 h-24 border-8",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div 
          className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4`}
          role="status"
          aria-label="Loading"
        />
        {message && <p className="text-gray-500">{message}</p>}
      </div>
    </div>
  );
}

export function LoadingPlaceholder3D() {
  return (
    <div className="w-full h-64 md:h-96 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
      <LoadingSpinner message="Cargando modelo 3D..." />
    </div>
  );
}
