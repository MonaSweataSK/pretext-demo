import { useEffect, useRef, useState, type FC } from 'react';
import styles from './FpsCounter.module.css';

export const FpsCounter: FC = () => {
  const [fps, setFps] = useState(60);
  const [blockMs, setBlockMs] = useState(0);
  const frames = useRef<number[]>([]);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!window.PerformanceObserver) return;
    
    const obs = new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last) setBlockMs(Math.round(last.duration));
    });
    
    try {
      obs.observe({ type: 'longtask', buffered: false });
    } catch (e) {
      console.warn("PerformanceObserver for longtask not supported");
    }
    
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const loop = () => {
      const now = performance.now();
      frames.current.push(now);

      // Keep only frames from the last 1000ms
      while (frames.current.length > 0 && frames.current[0] <= now - 1000) {
        frames.current.shift();
      }

      setFps(frames.current.length);
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  let colorClass = styles.green;
  if (fps < 40 || blockMs > 100) colorClass = styles.red;
  else if (fps < 55 || blockMs > 50) colorClass = styles.yellow;

  return (
    <div className={`${styles.counter} ${colorClass}`}>
      {fps} fps | last block: {blockMs}ms
    </div>
  );
};
