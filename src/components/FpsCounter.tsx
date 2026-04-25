import { useEffect, useRef, useState, type FC } from 'react';
import styles from './FpsCounter.module.css';

export const FpsCounter: FC = () => {
  const [fps, setFps] = useState(60);
  const frames = useRef<number[]>([]);
  const requestRef = useRef<number>(0);

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
  if (fps < 40) colorClass = styles.red;
  else if (fps < 55) colorClass = styles.yellow;

  return (
    <div className={`${styles.counter} ${colorClass}`}>
      {fps} fps
    </div>
  );
};
