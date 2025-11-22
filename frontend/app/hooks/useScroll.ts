// app/hooks/useScroll.ts
// Custom hooks for scroll detection and management

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to detect scroll direction
 * Returns 'up' | 'down' | null
 */
export function useScrollDirection(threshold: number = 10): 'up' | 'down' | null {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  
  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY;
    
    if (Math.abs(scrollY - lastScrollY.current) < threshold) {
      ticking.current = false;
      return;
    }
    
    setScrollDirection(scrollY > lastScrollY.current ? 'down' : 'up');
    lastScrollY.current = scrollY > 0 ? scrollY : 0;
    ticking.current = false;
  }, [threshold]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateScrollDirection]);
  
  return scrollDirection;
}

/**
 * Hook to get current scroll position
 */
export function useScrollPosition(): number {
  const [scrollPosition, setScrollPosition] = useState(0);
  const ticking = useRef(false);
  
  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.scrollY);
      ticking.current = false;
    };
    
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updatePosition);
        ticking.current = true;
      }
    };
    
    // Set initial position
    setScrollPosition(window.scrollY);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return scrollPosition;
}


/**
 * Hook to lock body scroll
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    if (isLocked) {
      document.body.style.overflow = 'hidden';
      // Prevent iOS scroll bounce
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    
    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isLocked]);
}

/**
 * Hook to handle smooth scroll to element
 */
export function useSmoothScroll() {
  const scrollToElement = useCallback((elementId: string, offset: number = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }, []);
  
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);
  
  return { scrollToElement, scrollToTop };
}

/**
 * Hook to detect scroll percentage
 */
export function useScrollPercentage(): number {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollY = window.scrollY;
      const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;
      
      setScrollPercentage(Math.min(100, Math.max(0, scrollPercent)));
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return scrollPercentage;
}

/**
 * Hook to detect if page is at top
 */
export function useIsScrolledToTop(threshold: number = 10): boolean {
  const scrollPosition = useScrollPosition();
  return scrollPosition < threshold;
}

/**
 * Hook to detect if page is at bottom
 */
export function useIsScrolledToBottom(threshold: number = 10): boolean {
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollY = window.scrollY;
      
      setIsAtBottom(scrollY + windowHeight >= documentHeight - threshold);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);
  
  return isAtBottom;
}