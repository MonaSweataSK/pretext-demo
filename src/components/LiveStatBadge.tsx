import { useEffect, useRef, type FC } from 'react';

interface LiveStatBadgeProps {
  getValue: () => string;
  className?: string;
}

export const LiveStatBadge: FC<LiveStatBadgeProps> = ({ getValue, className }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const loop = () => {
      if (spanRef.current) {
        const val = getValue();
        if (spanRef.current.textContent !== val) {
          spanRef.current.textContent = val;
        }
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [getValue]);

  return <span ref={spanRef} className={className} />;
};
