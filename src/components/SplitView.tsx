import type { ReactNode, FC } from 'react';
import { FpsCounter } from './FpsCounter';
import styles from './SplitView.module.css';

interface SplitViewProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export const SplitView: FC<SplitViewProps> = ({ leftPanel, rightPanel }) => {
  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={`${styles.badge} ${styles.badgeDom}`}>DOM Measure</div>
          <FpsCounter />
        </div>
        <div className={styles.content}>
          {leftPanel}
        </div>
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={`${styles.badge} ${styles.badgePretext}`}>Pretext</div>
          <FpsCounter />
        </div>
        <div className={styles.content}>
          {rightPanel}
        </div>
      </div>
    </div>
  );
};
