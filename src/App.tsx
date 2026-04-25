import { useMemo, useRef, useEffect } from 'react';
import { generateItems } from './data/generateItems';
import { SplitView } from './components/SplitView';
import { DomList } from './components/DomList/DomList';
import { PretextList } from './components/PretextList/PretextList';
import { JumpButton } from './components/JumpButton';
import type { VirtualListHandle } from './components/VirtualList/VirtualList';
import styles from './App.module.css';

// Initialize performance log
if (typeof window !== 'undefined') {
  window.__perfLog = {
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
  const items = useMemo(() => generateItems(1000), []);
  const domListRef = useRef<VirtualListHandle>(null);
  const pretextListRef = useRef<VirtualListHandle>(null);

  const handleJump = (index: number) => {
    domListRef.current?.scrollToIndex(index);
    pretextListRef.current?.scrollToIndex(index);
  };

  // PerformanceObserver for DOM scripting
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
        }
      }
    });

    try {
      observer.observe({ type: 'event', buffered: true });
    } catch (e) {
      console.warn("PerformanceObserver for events not supported");
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
          <JumpButton targetIndex={750} onJump={handleJump} />
          <button className={styles.logButton} onClick={() => console.table(window.__perfLog)}>
            Log Perf Stats
          </button>
        </div>
      </header>

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
