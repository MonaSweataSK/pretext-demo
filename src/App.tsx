import { useMemo, useRef, useEffect, useState } from 'react';
import { generateItems } from './data/generateItems';
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
  const [itemCount, setItemCount] = useState(1000);
  const [showImages, setShowImages] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [domJumpMs, setDomJumpMs] = useState<number | null>(null);
  const [pretextJumpMs, setPretextJumpMs] = useState<number | null>(null);
  const [jumpFlashTimer, setJumpFlashTimer] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const items = useMemo(() => generateItems(itemCount, showImages), [itemCount, showImages]);
  const domListRef = useRef<VirtualListHandle>(null);
  const pretextListRef = useRef<VirtualListHandle>(null);
  const autoScrollInterval = useRef<number | null>(null);

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
        // Find scroll containers and scroll them by 8px
        const containers = document.querySelectorAll(`[style*="overflow-y: scroll"]`);
        containers.forEach(el => {
          el.scrollTop += 8;
        });
      }, 16);
    }
  };

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
          {showImages && (
            <div className={styles.warningBadge} title="Unknown image dimensions invalidate Pretext offsets">
              ⚠️ Pretext Layout Broken
            </div>
          )}
          
          <select 
            className={styles.select} 
            value={itemCount} 
            onChange={e => setItemCount(Number(e.target.value))}
          >
            <option value={500}>500 items</option>
            <option value={1000}>1000 items</option>
            <option value={5000}>5000 items</option>
          </select>

          <label className={styles.toggleLabel}>
            <input 
              type="checkbox" 
              checked={showImages} 
              onChange={e => setShowImages(e.target.checked)} 
            />
            Show Images
          </label>

          <button 
            className={`${styles.logButton} ${isAutoScrolling ? styles.activeButton : ''}`} 
            onClick={toggleAutoScroll}
          >
            {isAutoScrolling ? 'Stop Auto Scroll' : 'Auto Scroll'}
          </button>

          <JumpButton 
            targetIndex={Math.floor(itemCount * 0.75)} 
            onJump={handleJump} 
            disabled={showImages}
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
