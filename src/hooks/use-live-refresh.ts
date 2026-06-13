import { useCallback, useEffect, useRef, useState } from 'react';

export type LiveRefreshContext = { silent: boolean };

export type LiveRefreshCallback = (ctx: LiveRefreshContext) => void | Promise<void>;

export interface UseLiveRefreshOptions {
  intervalMs?: number;
  enabled?: boolean;
  pauseWhenHidden?: boolean;
}

export interface UseLiveRefreshResult {
  refreshNow: () => Promise<void>;
  lastUpdatedAt: Date | null;
  isRefreshing: boolean;
}

export function useLiveRefresh(
  callback: LiveRefreshCallback,
  {
    intervalMs = 10_000,
    enabled = true,
    pauseWhenHidden = true,
  }: UseLiveRefreshOptions = {},
): UseLiveRefreshResult {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

  const execute = useCallback(async (silent: boolean) => {
    setIsRefreshing(true);
    try {
      await callbackRef.current({ silent });
      setLastUpdatedAt(new Date());
      hasLoadedRef.current = true;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const refreshNow = useCallback(async () => {
    await execute(false);
  }, [execute]);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stopInterval = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startInterval = () => {
      stopInterval();
      intervalId = setInterval(() => {
        void execute(true);
      }, intervalMs);
    };

    void execute(hasLoadedRef.current);

    if (!pauseWhenHidden || !document.hidden) {
      startInterval();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
        return;
      }
      void execute(true);
      startInterval();
    };

    if (pauseWhenHidden) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      stopInterval();
      if (pauseWhenHidden) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [enabled, intervalMs, pauseWhenHidden, execute]);

  return { refreshNow, lastUpdatedAt, isRefreshing };
}
