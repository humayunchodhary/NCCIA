import { useEffect, useRef } from 'react';

/**
 * Poll `callback` every `intervalMs` while the tab is visible.
 * Does NOT re-run on mount visibility flicker in a way that remounts forms —
 * only for list pages. Skips when document is hidden.
 */
export function useAutoRefresh(callback, deps = [], intervalMs = 60000) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    const run = () => {
      if (document.visibilityState !== 'visible') return;
      // Never refresh while user is typing in an input
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      saved.current();
    };

    // Initial load once
    saved.current();
    const timer = setInterval(run, intervalMs);

    return () => clearInterval(timer);
  }, deps);
}
