import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@remix-run/react';

type Props = {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  ariaLabel?: string;
  fullWidth?: boolean;
  showSparkles?: boolean;
};

const CTAButton: React.FC<Props> = ({ to, onClick, children, variant = 'primary', ariaLabel, fullWidth = false, showSparkles = true }) => {
  const base =
    'relative inline-flex items-center justify-center gap-3 font-gochi font-bold text-xl px-8 py-5 rounded-full transition-all duration-400 ease-out group overflow-hidden';

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  const primary =
    'bg-primary text-white shadow-[0_8px_30px_rgba(255,107,53,0.3)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.5)] transform hover:scale-105';

  const secondary = 'border-2 border-gray-300 text-gray-700 hover:border-accent hover:text-accent hover:bg-accent/5';

  const outline = 'border-2 border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5';

  const variantClass = variant === 'primary' ? primary : variant === 'secondary' ? secondary : outline;

  const content = (
    <motion.div
      className={`${base} ${widthClass} ${variantClass}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {showSparkles && (
        <>
          <span className="absolute -top-1 left-2 text-yellow-300 text-2xl animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.6))' }}>
            ✨
          </span>
          <span className="absolute -bottom-1 right-2 text-yellow-300 text-xl animate-pulse" style={{ animationDelay: '0.3s', filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.6))' }}>
            ✨
          </span>
        </>
      )}

      <span className="relative z-10">{children}</span>

      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} className="group" aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return <>{content}</>;
};

export default CTAButton;
