// app/components/Header.tsx - Versión Optimizada
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { CartButton } from "~/components/Cart";
import { useScrollDirection, useScrollPosition } from "~/hooks/useScroll";
import { motion, AnimatePresence } from "framer-motion";
import type { NavigationItem } from "~/config/navigation";
import { navigationConfig } from "~/config/navigation";
import clsx from "clsx";

interface HeaderProps {
  className?: string;
  variant?: 'default' | 'transparent' | 'minimal';
}

export function Header({ className, variant = 'default' }: HeaderProps) {
  const { t, i18n, ready } = useTranslation("common");
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollDirection = useScrollDirection();
  const scrollPosition = useScrollPosition();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Header visibility based on scroll
  const isHeaderVisible = scrollDirection === 'up' || scrollPosition < 100;
  const isScrolled = scrollPosition > 20;
  
  // Effect for mounting state
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);
  
  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Memoized toggle language function
  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  }, [i18n]);
  
  // Memoized navigation items
  const navigationItems = useMemo(() => navigationConfig.mainNav, []);
  
  // Check if link is active
  const isLinkActive = useCallback((path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);
  
  // Loading state
  if (!ready) {
    return <HeaderSkeleton />;
  }
  
  // Header classes based on state
  const headerClasses = clsx(
    "fixed top-0 z-50 w-full transition-all duration-300",
    {
      // Base styles by variant
      'bg-nebu-bg/80 backdrop-blur-lg shadow-lg': variant === 'default' && isScrolled,
      'bg-nebu-bg/70 backdrop-blur-md': variant === 'default' && !isScrolled,
      'bg-transparent': variant === 'transparent' && !isScrolled,
      'bg-nebu-bg/85 shadow-sm backdrop-blur-sm': variant === 'minimal',
      
      // Scroll behavior
      'translate-y-0': isHeaderVisible,
      '-translate-y-full': !isHeaderVisible && scrollPosition > 200,
      
      // Custom className
      [className || '']: className,
    }
  );
  
  return (
    <>
      <motion.header 
        className={headerClasses}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <nav 
          className="container mx-auto px-4 sm:px-6 lg:px-8"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className={clsx(
            "flex items-center justify-between transition-all duration-300",
            isScrolled ? "py-3" : "py-4 lg:py-6"
          )}>
            {/* Logo */}
            <Link 
              to="/" 
              className="flex-shrink-0 z-50"
              aria-label="Flow-Telligence Home"
            >
              <img
                src="/assets/logos/logo-flow-header.svg"
                alt="Flow-Telligence"
                className={clsx(
                  "transition-all duration-300",
                  isScrolled ? "h-6 lg:h-7" : "h-7 lg:h-8"
                )}
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-6">
                {navigationItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      item={item}
                      isActive={isLinkActive(item.path)}
                      t={t}
                    />
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3 z-50">
              {/* Cart Button */}
              <CartButton />
              
              {/* Language Switcher */}
              <LanguageSwitcher 
                currentLang={i18n.language}
                onToggle={toggleLanguage}
              />
              
              {/* Mobile Menu Button */}
              <MobileMenuButton
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </div>
          </div>
        </nav>
      </motion.header>
      
      {/* Mobile Menu */}
      <MobileMenu
        ref={menuRef}
        isOpen={isMenuOpen}
        isMounted={isMounted}
        navigationItems={navigationItems}
        currentPath={location.pathname}
        isLinkActive={isLinkActive}
        onClose={() => setIsMenuOpen(false)}
        t={t}
      />
      
      {/* Spacer for fixed header */}
      <div className={clsx(
        "transition-all duration-300",
        isScrolled ? "h-14 lg:h-16" : "h-16 lg:h-20"
      )} />
    </>
  );
}

// Navigation Link Component
interface NavLinkProps {
  item: NavigationItem;
  isActive: boolean;
  t: (key: string) => string;
  onClick?: () => void;
  className?: string;
}

function NavLink({ item, isActive, t, onClick, className }: NavLinkProps) {
  const baseClasses = "relative font-medium transition-all duration-300 py-2";
  const stateClasses = isActive
    ? "text-purple-600"
    : "text-gray-700 hover:text-purple-600";
  
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={clsx(baseClasses, stateClasses, className)}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="relative">
        {t(item.labelKey)}
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-600"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30,
            }}
          />
        )}
      </span>
    </Link>
  );
}

// Language Switcher Component
interface LanguageSwitcherProps {
  currentLang: string;
  onToggle: () => void;
}

function LanguageSwitcher({ currentLang, onToggle }: LanguageSwitcherProps) {
  return (
    <button
      onClick={onToggle}
      type="button"
      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-300 rounded-lg transition-all duration-300 hover:shadow-sm group"
      aria-label={`Change language to ${currentLang === 'es' ? 'English' : 'Español'}`}
    >
      <svg 
        className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
        />
      </svg>
      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
        {currentLang.toUpperCase()}
      </span>
    </button>
  );
}

// Mobile Menu Button Component
interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      type="button"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.path
              key="close"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <motion.path
              key="menu"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </svg>
    </button>
  );
}

// Mobile Menu Component
interface MobileMenuProps {
  isOpen: boolean;
  isMounted: boolean;
  navigationItems: NavigationItem[];
  currentPath: string;
  isLinkActive: (path: string) => boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const MobileMenu = React.forwardRef<HTMLDivElement, MobileMenuProps>(
  ({ isOpen, isMounted, navigationItems, isLinkActive, onClose, t }, ref) => {
    return (
      <>
        {/* Backdrop */}
        <AnimatePresence>
          {isOpen && isMounted && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
          )}
        </AnimatePresence>
        
        {/* Menu Panel */}
        <AnimatePresence>
          {isOpen && isMounted && (
            <motion.div
              ref={ref}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-40 lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: "spring", 
                damping: 30, 
                stiffness: 300 
              }}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <img
                    src="/assets/logos/logo-flow-header.svg"
                    alt="Flow-Telligence"
                    className="h-7"
                  />
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close menu"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6">
                  <ul className="px-6 space-y-1">
                    {navigationItems.map((item, index) => (
                      <motion.li
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={onClose}
                          className={clsx(
                            "block px-4 py-3 rounded-lg font-medium transition-all",
                            isLinkActive(item.path)
                              ? "bg-purple-50 text-purple-600"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                          aria-current={isLinkActive(item.path) ? 'page' : undefined}
                        >
                          {t(item.labelKey)}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
                
                {/* Menu Footer */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={onClose}
                    >
                      {t("auth.login")}
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-center text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      onClick={onClose}
                    >
                      {t("auth.signup")}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';

// Header Skeleton Component
function HeaderSkeleton() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="hidden lg:flex items-center gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </nav>
    </header>
  );
}

// Icon Components
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Re-export for convenience
export default Header;