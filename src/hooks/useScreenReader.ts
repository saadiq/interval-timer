// src/hooks/useScreenReader.ts
import { useRef, useCallback } from 'react';

interface UseScreenReaderOptions {
  politeness?: 'polite' | 'assertive';
  clearPrevious?: boolean;
}

export function useScreenReader(options: UseScreenReaderOptions = {}) {
  const {
    politeness = 'polite',
    clearPrevious = true
  } = options;

  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Create live region on first use
  const ensureLiveRegion = useCallback(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }
    return liveRegionRef.current;
  }, [politeness]);

  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    const liveRegion = ensureLiveRegion();
    
    if (clearPrevious) {
      liveRegion.textContent = '';
    }
    
    // Use provided priority or default
    const currentPoliteness = priority || politeness;
    liveRegion.setAttribute('aria-live', currentPoliteness);
    
    // Small delay to ensure screen readers pick up the change
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }, [ensureLiveRegion, clearPrevious, politeness]);

  const clear = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
  }, []);

  return { announce, clear };
}