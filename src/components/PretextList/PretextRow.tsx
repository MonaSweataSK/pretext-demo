import type { CSSProperties, FC } from 'react';
import type { Item } from '../../data/generateItems';
import styles from '../DomList/DomRow.module.css';

interface PretextRowProps {
  item: Item;
  style: CSSProperties;
}

export const PretextRow: FC<PretextRowProps> = ({ item, style }) => {
  return (
    <div style={style} className={styles.rowWrapper}>
      <div className={styles.row}>
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
            // Pretext knows nothing about this height! Overlaps/tearing guaranteed.
          />
        )}
      </div>
    </div>
  );
};
