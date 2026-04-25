import type { ReactNode, FC } from 'react';
import { FpsCounter } from './FpsCounter';
import { LiveStatBadge } from './LiveStatBadge';
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
          <div className={styles.headerRight}>
            <LiveStatBadge 
              className={styles.statBadge} 
              getValue={() => `${window.__perfLog?.domMeasure?.reflowCount || 0} reflows`} 
            />
            <FpsCounter />
          </div>
        </div>
        <div className={styles.content}>
          {leftPanel}
        </div>
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={`${styles.badge} ${styles.badgePretext}`}>Pretext</div>
          <div className={styles.headerRight}>
            <LiveStatBadge 
              className={styles.statBadge} 
              getValue={() => `Prepared in ${Math.round(window.__perfLog?.pretext?.prepareMs || 0)}ms`} 
            />
            <FpsCounter />
          </div>
        </div>
        <div className={styles.content}>
          {rightPanel}
        </div>
      </div>
    </div>
  );
};
