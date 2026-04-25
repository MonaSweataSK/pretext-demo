import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import type { Item } from '../../data/generateItems';
import { usePretextMeasure } from '../../hooks/usePretextMeasure';
import { VirtualList, type VirtualListHandle } from '../VirtualList/VirtualList';
import { PretextRow } from './PretextRow';
import styles from './PretextList.module.css';

interface PretextListProps {
  items: Item[];
  containerHeight: number;
}

export const PretextList = forwardRef<VirtualListHandle, PretextListProps>(({ items, containerHeight }, ref) => {
  const { heights, ready } = usePretextMeasure(items);
  const listRef = useRef<VirtualListHandle>(null);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      const start = performance.now();
      listRef.current?.scrollToIndex(index);
      
      requestAnimationFrame(() => {
        if (window.__perfLog) {
          window.__perfLog.pretext.jumpLatencyMs = performance.now() - start;
        }
      });
    }
  }));

  const getHeight = useCallback((index: number) => {
    return heights[index];
  }, [heights]);

  if (!ready) {
    return (
      <div className={styles.loadingContainer} style={{ height: containerHeight }}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Calculating math-first layouts...</div>
      </div>
    );
  }

  return (
    <VirtualList
      ref={listRef}
      items={items}
      getHeight={getHeight}
      containerHeight={containerHeight}
      renderRow={(index, style) => (
        <PretextRow
          key={items[index].id}
          item={items[index]}
          style={style}
        />
      )}
    />
  );
});

PretextList.displayName = 'PretextList';
