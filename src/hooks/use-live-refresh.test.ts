import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveRefresh } from './use-live-refresh';

describe('useLiveRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('runs callback immediately on mount with silent=false', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() => useLiveRefresh(callback, { intervalMs: 10_000 }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ silent: false });
  });

  it('fires callback on interval with silent=true', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() => useLiveRefresh(callback, { intervalMs: 5_000 }));

    await act(async () => {
      await Promise.resolve();
    });
    callback.mockClear();

    await act(async () => {
      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ silent: true });
  });

  it('pauses interval when document is hidden', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useLiveRefresh(callback, { intervalMs: 5_000, pauseWhenHidden: true }),
    );

    await act(async () => {
      await Promise.resolve();
    });
    callback.mockClear();

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('refetches once when tab becomes visible again', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useLiveRefresh(callback, { intervalMs: 5_000, pauseWhenHidden: true }),
    );

    await act(async () => {
      await Promise.resolve();
    });
    callback.mockClear();

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await Promise.resolve();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ silent: true });
  });

  it('cleans up interval on unmount', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = renderHook(() =>
      useLiveRefresh(callback, { intervalMs: 5_000 }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('does not run when enabled is false', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    renderHook(() => useLiveRefresh(callback, { enabled: false }));

    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(10_000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('refreshNow runs with silent=false', async () => {
    const callback = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useLiveRefresh(callback, { intervalMs: 10_000 }));

    await act(async () => {
      await Promise.resolve();
    });
    callback.mockClear();

    await act(async () => {
      await result.current.refreshNow();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ silent: false });
  });
});
