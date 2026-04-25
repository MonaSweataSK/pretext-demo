/// <reference types="vite/client" />

interface Window {
  __perfLog: {
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
