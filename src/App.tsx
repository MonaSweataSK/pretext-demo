import { useRef, useEffect, useState } from 'react';
import { generateItems, type Item } from './data/generateItems';
import { SplitView } from './components/SplitView';
import { DomList } from './components/DomList/DomList';
import { PretextList } from './components/PretextList/PretextList';
import { JumpButton } from './components/JumpButton';
import { ComparisonModal } from './components/ComparisonModal/ComparisonModal';
import type { VirtualListHandle } from './components/VirtualList/VirtualList';
import styles from './App.module.css';

// Initialize performance log
if (typeof window !== 'undefined') {
  window.__perfLog = {
    globalLongtaskCount: 0,
    domMeasure: {
      avgScrollScriptingMs: 0,
      reflowCount: 0,
      jumpLatencyMs: 0,
    },
    pretext: {
      prepareMs: 0,
      layoutMs: 0,
      jumpLatencyMs: 0,
    }
  };
}

function App() {
  const [countMode, setCountMode] = useState<string>('1000');
  const [customCount, setCustomCount] = useState<number>(1000);
  const [items, setItems] = useState<Item[]>(() => generateItems(1000));
  
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(1);
  
  const [domJumpMs, setDomJumpMs] = useState<number | null>(null);
  const [pretextJumpMs, setPretextJumpMs] = useState<number | null>(null);
  const [jumpFlashTimer, setJumpFlashTimer] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const domListRef = useRef<VirtualListHandle>(null);
  const pretextListRef = useRef<VirtualListHandle>(null);
  const autoScrollInterval = useRef<number | null>(null);
  const itemsRef = useRef(items);
  const isAppending = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (countMode === 'custom') {
      setItems(generateItems(customCount));
    } else if (countMode === 'indefinite') {
      setItems(generateItems(500));
    } else {
      setItems(generateItems(Number(countMode)));
    }
  }, [countMode, customCount]);

  const handleJump = (index: number) => {
    domListRef.current?.scrollToIndex(index);
    pretextListRef.current?.scrollToIndex(index);
    
    requestAnimationFrame(() => {
      // Fallback: the lists themselves report latency to __perfLog via requestAnimationFrame
      // We will read it after a small delay
      setTimeout(() => {
        setDomJumpMs(Math.round(window.__perfLog.domMeasure.jumpLatencyMs));
        setPretextJumpMs(Math.round(window.__perfLog.pretext.jumpLatencyMs));
        
        if (jumpFlashTimer) clearTimeout(jumpFlashTimer);
        setJumpFlashTimer(window.setTimeout(() => {
          setDomJumpMs(null);
          setPretextJumpMs(null);
        }, 1500));
      }, 50);
    });
  };

  const toggleAutoScroll = () => {
    if (isAutoScrolling) {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      setIsAutoScrolling(false);
    } else {
      setIsAutoScrolling(true);
      autoScrollInterval.current = window.setInterval(() => {
        domListRef.current?.scrollBy(8 * autoScrollSpeed);
        pretextListRef.current?.scrollBy(8 * autoScrollSpeed);

        // Check for indefinite append or infinite loop
        if (domListRef.current) {
          const info = domListRef.current.getScrollInfo();
          if (info.top + 1000 >= info.max) {
            if (countMode === 'indefinite') {
              if (!isAppending.current) {
                isAppending.current = true;
                const currentLen = itemsRef.current.length;
                const newItems = generateItems(100, currentLen);
                setItems(prev => [...prev, ...newItems]);
                setTimeout(() => { isAppending.current = false; }, 100);
              }
            } else {
              // Standard loop back to top
              domListRef.current.scrollToIndex(0);
              pretextListRef.current?.scrollToIndex(0);
            }
          }
        }
      }, 16);
    }
  };

  // Keep auto-scroll speed updated
  useEffect(() => {
    if (isAutoScrolling) {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      setIsAutoScrolling(false);
      toggleAutoScroll(); // restart with new speed
    }
  }, [autoScrollSpeed]);

  useEffect(() => {
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, []);

  // PerformanceObserver for DOM scripting and longtasks
  useEffect(() => {
    if (!window.PerformanceObserver) return;
    
    let totalScriptingTime = 0;
    let entryCount = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'Event:scroll') {
          totalScriptingTime += entry.duration;
          entryCount++;
          window.__perfLog.domMeasure.avgScrollScriptingMs = totalScriptingTime / entryCount;
        } else if (entry.entryType === 'longtask') {
          window.__perfLog.globalLongtaskCount++;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['event', 'longtask'] });
    } catch (e) {
      console.warn("PerformanceObserver not supported");
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>List Virtualization Perf Test</h1>
          <p className={styles.subtitle}>DOM getBoundingClientRect vs Pretext Layout Engine</p>
        </div>
        <div className={styles.controls}>
          <select 
            className={styles.select} 
            value={countMode} 
            onChange={e => setCountMode(e.target.value)}
          >
            <option value="500">500 items</option>
            <option value="1000">1000 items</option>
            <option value="5000">5000 items</option>
            <option value="custom">Custom...</option>
            <option value="indefinite">Indefinite (Infinite Scroll)</option>
          </select>

          {countMode === 'custom' && (
            <input 
              type="number" 
              className={styles.input} 
              value={customCount} 
              onChange={e => setCustomCount(Math.max(1, Number(e.target.value)))}
              placeholder="e.g. 2500"
            />
          )}

          <div className={styles.speedControls}>
            <span className={styles.speedLabel}>Speed:</span>
            {[1, 2, 5].map(speed => (
              <button 
                key={speed}
                className={`${styles.speedButton} ${autoScrollSpeed === speed ? styles.activeButton : ''}`}
                onClick={() => setAutoScrollSpeed(speed)}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button 
            className={`${styles.logButton} ${isAutoScrolling ? styles.activeButton : ''}`} 
            onClick={toggleAutoScroll}
          >
            {isAutoScrolling ? 'Stop Auto Scroll' : 'Auto Scroll'}
          </button>

          <JumpButton 
            maxIndex={items.length} 
            onJump={handleJump} 
          />
          <button className={styles.logButton} onClick={() => setShowModal(true)}>
            View Final Comparison
          </button>
        </div>
      </header>

      {showModal && <ComparisonModal onClose={() => setShowModal(false)} />}

      {domJumpMs !== null && pretextJumpMs !== null && (
        <div className={styles.flashBadgeContainer}>
          <div className={styles.flashBadge}>
            DOM: {domJumpMs}ms | Pretext: {pretextJumpMs}ms
          </div>
        </div>
      )}

      <main className={styles.main}>
        <SplitView
          leftPanel={<DomList ref={domListRef} items={items} containerHeight={600} />}
          rightPanel={<PretextList ref={pretextListRef} items={items} containerHeight={600} />}
        />
      </main>
    </div>
  );
}

export default App;
