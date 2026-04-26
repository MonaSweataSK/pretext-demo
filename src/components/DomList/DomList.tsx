import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Item } from '../../data/generateItems';
import { useDomMeasure } from '../../hooks/useDomMeasure';
import { VirtualList, type VirtualListHandle } from '../VirtualList/VirtualList';
import { DomRow } from './DomRow';

interface DomListProps {
  items: Item[];
  containerHeight: number;
}

export const DomList = forwardRef<VirtualListHandle, DomListProps>(({ items, containerHeight }, ref) => {
  const { getHeight, measureRef } = useDomMeasure();
  const listRef = useRef<VirtualListHandle>(null);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      const start = performance.now();
      listRef.current?.scrollToIndex(index);

      // Request animation frame to measure when the scroll actually settles
      requestAnimationFrame(() => {
        if (window.__perfLog) {
          window.__perfLog.domMeasure.jumpLatencyMs = performance.now() - start;
        }
      });
    },
    scrollBy: (amount: number) => {
      listRef.current?.scrollBy(amount);
    }
  }));

  return (
    <VirtualList
      ref={listRef}
      items={items}
      getHeight={getHeight}
      containerHeight={containerHeight}
      renderRow={(index, style) => (
        <DomRow
          key={items[index].id}
          item={items[index]}
          index={index}
          style={style}
          measureRef={measureRef}
        />
      )}
    />
  );
});

DomList.displayName = 'DomList';
