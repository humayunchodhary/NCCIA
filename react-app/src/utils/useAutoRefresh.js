import { useEffect, useRef } from 'react';

/**
 * Poll `callback` on mount and every `intervalMs` (default 30s).
 * Also re-runs when the tab becomes visible again.
 */
export function useAutoRefresh(callback, deps = [], intervalMs = 30000) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    const run = () => saved.current();

    run();
    const timer = setInterval(run, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        run();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, deps);
}
