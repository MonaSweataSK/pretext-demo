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
  const [seedVersion, setSeedVersion] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [domJumpMs, setDomJumpMs] = useState<number | null>(null);
  const [pretextJumpMs, setPretextJumpMs] = useState<number | null>(null);
  const [jumpFlashTimer, setJumpFlashTimer] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // We use seedVersion to force generation of a new random batch
  const items = useMemo(() => generateItems(), [seedVersion]);
  const domListRef = useRef<VirtualListHandle>(null);
  const pretextListRef = useRef<VirtualListHandle>(null);

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

  useEffect(() => {
    if (scrollSpeed === 0) return;

    let animationFrameId: number;
    
    const autoScroll = () => {
      domListRef.current?.scrollBy(scrollSpeed);
      pretextListRef.current?.scrollBy(scrollSpeed);
      
      // Auto loop to top logic could go here if we had access to max height,
      // but for 1000+ items, it runs for a long time anyway.
      
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollSpeed]);

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
          <button className={styles.actionButton} onClick={() => setSeedVersion(v => v + 1)}>
            Load Random Batch
          </button>

          <div className={styles.speedGroup}>
            <button 
              className={`${styles.speedButton} ${scrollSpeed === 0 ? styles.activeSpeed : ''}`} 
              onClick={() => setScrollSpeed(0)}
            >Stop</button>
            <button 
              className={`${styles.speedButton} ${scrollSpeed === 2 ? styles.activeSpeed : ''}`} 
              onClick={() => setScrollSpeed(2)}
            >1x Speed</button>
            <button 
              className={`${styles.speedButton} ${scrollSpeed === 8 ? styles.activeSpeed : ''}`} 
              onClick={() => setScrollSpeed(8)}
            >5x Speed</button>
            <button 
              className={`${styles.speedButton} ${scrollSpeed === 20 ? styles.activeSpeed : ''}`} 
              onClick={() => setScrollSpeed(20)}
            >Max Speed</button>
          </div>

          <JumpButton 
            targetIndex={Math.floor(items.length * 0.75)} 
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
