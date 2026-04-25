import { useRef, useCallback, useState, useEffect } from 'react';

export function useDomMeasure() {
  const heightsRef = useRef<Map<number, number>>(new Map());
  const [, forceRender] = useState({});
  const observerRef = useRef<ResizeObserver | null>(null);

  // Initialize ResizeObserver
  useEffect(() => {
    observerRef.current = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const indexStr = target.getAttribute('data-index');
        if (indexStr) {
          const index = parseInt(indexStr, 10);
          const height = entry.contentRect.height;
          // Trigger a DOM perf hit on purpose just to check
          target.getBoundingClientRect(); 
          if (window.__perfLog) {
            window.__perfLog.domMeasure.reflowCount++;
          }
          
          if (heightsRef.current.get(index) !== height) {
            heightsRef.current.set(index, height);
            changed = true;
          }
        }
      }
      if (changed) {
        forceRender({}); // Force virtual list to update offsets
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const measureRef = useCallback((el: HTMLElement | null, index: number) => {
    if (el) {
      if (window.__perfLog) {
        window.__perfLog.domMeasure.reflowCount++;
      }
      // Initial measure
      const rect = el.getBoundingClientRect();
      heightsRef.current.set(index, rect.height);
      
      el.setAttribute('data-index', index.toString());
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    }
  }, []);

  const getHeight = useCallback((index: number) => {
    return heightsRef.current.get(index) || 80; // 80px estimate
  }, []);

  return { getHeight, measureRef };
}
