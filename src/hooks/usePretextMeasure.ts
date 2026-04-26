import { useState, useEffect, useRef } from 'react';
import { prepare, layout } from '@chenglou/pretext';
import type { Item } from '../data/generateItems';

// Config matches CSS exactly
// panel is 640px wide, 16px padding on both sides = 608px inner width
const CONFIG = {
  fontStr: '14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  width: 608,
  lineHeight: 20
};

export function usePretextMeasure(items: Item[]) {
  const [ready, setReady] = useState(false);
  const heightsRef = useRef<number[]>([]);

  useEffect(() => {
    let active = true;

    // Use setTimeout to allow the "Calculating..." UI to render first
    setTimeout(() => {
      if (!active) return;

      const previousCount = heightsRef.current.length;
      if (items.length <= previousCount && previousCount > 0) {
        // Just checking if we need to reset or already calculated.
        // If items decreased or changed completely, we might need a better check,
        // but since we only append in indefinite mode, this works.
        if (items.length < previousCount) {
          heightsRef.current = [];
        } else {
          setReady(true);
          return;
        }
      }

      const startIndex = heightsRef.current.length;
      const newItems = items.slice(startIndex);
      
      if (newItems.length === 0) {
        setReady(true);
        return;
      }

      const startPrep = performance.now();
      const preparedTexts = newItems.map(item => prepare(item.text, CONFIG.fontStr));
      const endPrep = performance.now();
      
      const startLayout = performance.now();
      const newHeights = new Array(newItems.length);
      
      for (let i = 0; i < newItems.length; i++) {
        const metrics = layout(preparedTexts[i], CONFIG.width, CONFIG.lineHeight);
        newHeights[i] = metrics.height + 60;
      }
      
      const endLayout = performance.now();

      if (window.__perfLog) {
        window.__perfLog.pretext.prepareMs += (endPrep - startPrep);
        window.__perfLog.pretext.layoutMs += (endLayout - startLayout);
      }

      heightsRef.current = [...heightsRef.current, ...newHeights];
      setReady(true);
    }, 50);

    return () => {
      active = false;
    };
  }, [items]);

  return { heights: heightsRef.current, ready };
}
