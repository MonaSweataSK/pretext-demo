import { type FC } from 'react';
import styles from './ComparisonModal.module.css';

interface ComparisonModalProps {
  onClose: () => void;
}

export const ComparisonModal: FC<ComparisonModalProps> = ({ onClose }) => {
  const stats = window.__perfLog;
  
  if (!stats) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Performance Comparison</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>DOM Measure (Bad)</th>
                <th>Pretext (Good)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Initial Prep Time</td>
                <td>0ms (Lazy)</td>
                <td className={styles.highlightGood}>{Math.round(stats.pretext.prepareMs)}ms (Upfront)</td>
              </tr>
              <tr>
                <td>Scroll Scripting Avg</td>
                <td className={styles.highlightBad}>{stats.domMeasure.avgScrollScriptingMs.toFixed(2)}ms</td>
                <td className={styles.highlightGood}>~0ms</td>
              </tr>
              <tr>
                <td>Reflow Hits</td>
                <td className={styles.highlightBad}>{stats.domMeasure.reflowCount}</td>
                <td className={styles.highlightGood}>0</td>
              </tr>
              <tr>
                <td>Jump Latency (750)</td>
                <td className={styles.highlightBad}>{stats.domMeasure.jumpLatencyMs > 0 ? `${stats.domMeasure.jumpLatencyMs}ms` : 'N/A'}</td>
                <td className={styles.highlightGood}>{stats.pretext.jumpLatencyMs > 0 ? `${stats.pretext.jumpLatencyMs}ms` : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className={styles.summaryBox}>
          <strong>Global Main Thread Blocks (&gt;50ms):</strong> {stats.globalLongtaskCount} Longtasks
        </div>
      </div>
    </div>
  );
};
