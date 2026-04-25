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

      const heights = new Array(items.length);
      const startPrep = performance.now();
      
      const preparedTexts = items.map(item => prepare(item.text, CONFIG.fontStr));
      
      const endPrep = performance.now();
      const startLayout = performance.now();
      
      for (let i = 0; i < items.length; i++) {
        // Height includes header (username + timestamp + margin) and text
        // Header height: roughly 20px (line height of 14px text) + 8px margin = 28px
        // Padding: 16px top + 16px bottom = 32px
        // Base fixed height per row = 28 + 32 = 60px
        
        // Using pretext layout to get the text height
        const metrics = layout(preparedTexts[i], CONFIG.width, CONFIG.lineHeight);

        // Pretext layout gives us lines/dimensions. 
        heights[i] = metrics.height + 60;
      }
      
      const endLayout = performance.now();

      if (window.__perfLog) {
        window.__perfLog.pretext.prepareMs = endPrep - startPrep;
        window.__perfLog.pretext.layoutMs = endLayout - startLayout;
      }

      heightsRef.current = heights;
      setReady(true);
    }, 50);

    return () => {
      active = false;
    };
  }, [items]);

  return { heights: heightsRef.current, ready };
}
