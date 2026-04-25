import { useEffect, useRef } from 'react';
import type { Item } from '../../data/generateItems';
import styles from './DomRow.module.css';

interface DomRowProps {
  item: Item;
  index: number;
  style: React.CSSProperties;
  measureRef: (el: HTMLElement | null, index: number) => void;
}

export const DomRow: React.FC<DomRowProps> = ({ item, index, style, measureRef }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    measureRef(rowRef.current, index);
  }, [measureRef, index, item.text]);

  return (
    <div style={style} className={styles.rowWrapper}>
      <div ref={rowRef} className={styles.row}>
        <div className={styles.header}>
          <span className={styles.username}>@{item.username}</span>
          <span className={styles.timestamp}>{item.timestamp}</span>
        </div>
        <div className={styles.text} dir={item.lang === 'ar' ? 'rtl' : 'ltr'}>
          {item.text}
        </div>
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            alt="Attached content" 
            className={styles.attachedImage} 
            // On load, the ResizeObserver will catch the new height and trigger reflow
          />
        )}
      </div>
    </div>
  );
};
