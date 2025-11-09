import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@remix-run/react';

type Props = {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  ariaLabel?: string;
};

const CTAButton: React.FC<Props> = ({ to, onClick, children, variant = 'primary', ariaLabel }) => {
  const base =
    'relative inline-flex items-center gap-3 font-gochi font-bold text-xl px-12 py-6 rounded-full transition-all duration-400 ease-out group overflow-hidden';

  const primary =
    'bg-primary text-white shadow-[0_8px_30px_rgb(255,107,53,0.3)] hover:shadow-[0_12px_40px_rgb(255,107,53,0.5)] transform hover:scale-110 hover:-rotate-6';

  const secondary = 'border-2 border-gray-300 text-gray-700 hover:border-accent hover:text-accent hover:bg-accent/5 py-5 px-8 rounded-2xl';

  const content = (
    <motion.div
      className={`${base} ${variant === 'primary' ? primary : secondary}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className="absolute -top-1 left-2 text-yellow-300 text-2xl animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.6))' }}>
        ✨
      </span>
      <span className="absolute -bottom-1 right-2 text-yellow-300 text-xl animate-pulse" style={{ animationDelay: '0.3s', filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.6))' }}>
        ✨
      </span>

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
