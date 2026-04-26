import { useState, useEffect, useRef, useImperativeHandle, forwardRef, type CSSProperties, type ReactNode } from 'react';
import type { Item } from '../../data/generateItems';

export interface VirtualListProps {
  items: Item[];
  getHeight: (index: number) => number;
  renderRow: (index: number, style: CSSProperties) => ReactNode;
  containerHeight: number;
}

export interface VirtualListHandle {
  scrollToIndex: (index: number) => void;
  scrollBy: (amount: number) => void;
  getScrollInfo: () => { top: number; max: number };
}

export const VirtualList = forwardRef<VirtualListHandle, VirtualListProps>(({ items, getHeight, renderRow, containerHeight }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Compute cumulative offsets on every render
  // (necessary because getHeight results can change dynamically via ResizeObserver)
  const offsets = new Float64Array(items.length);
  let currentTotal = 0;
  for (let i = 0; i < items.length; i++) {
    offsets[i] = currentTotal;
    currentTotal += getHeight(i);
  }
  const totalHeight = currentTotal;

  // Handle scroll events directly to avoid React batching delays
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrollTop(el.scrollTop);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      if (containerRef.current) {
        // Find the offset for the index
        const top = offsets[index] || 0;
        containerRef.current.scrollTop = top;
        setScrollTop(top);
      }
    },
    scrollBy: (amount: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop += amount;
        setScrollTop(containerRef.current.scrollTop);
      }
    },
    getScrollInfo: () => {
      return {
        top: containerRef.current?.scrollTop || 0,
        max: totalHeight - containerHeight
      };
    }
  }));

  // Find start and end index based on scrollTop
  let startIndex = 0;
  let endIndex = 0;

  // Binary search could be used, but linear is fine for 1000 items
  for (let i = 0; i < items.length; i++) {
    if (offsets[i] + getHeight(i) > scrollTop) {
      startIndex = i;
      break;
    }
  }

  const scrollBottom = scrollTop + containerHeight;
  for (let i = startIndex; i < items.length; i++) {
    if (offsets[i] > scrollBottom) {
      endIndex = i;
      break;
    }
    if (i === items.length - 1) endIndex = i;
  }

  // Overscan
  const overscan = 3;
  startIndex = Math.max(0, startIndex - overscan);
  endIndex = Math.min(items.length - 1, endIndex + overscan);

  const visibleRows = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleRows.push(
      renderRow(i, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${offsets[i]}px)`
      })
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflowY: 'scroll',
        overflowX: 'hidden',
        position: 'relative',
        willChange: 'transform'
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRows}
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';
