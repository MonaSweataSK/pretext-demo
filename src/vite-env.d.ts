/// <reference types="vite/client" />

interface Window {
  __perfLog: {
    globalLongtaskCount: number;
    domMeasure: {
      avgScrollScriptingMs: number;
      reflowCount: number;
      jumpLatencyMs: number;
    };
    pretext: {
      prepareMs: number;
      layoutMs: number;
      jumpLatencyMs: number;
    };
  };
}
