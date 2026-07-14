import { useEffect, type ReactNode } from 'react';

import { useWindowShortcuts } from '@/hooks/use-window-shortcuts';
import { useWindowStore } from '@/stores/window-store';
import {
  detectTauriRuntime,
  ensureWindowConstraints,
  ensureWindowVisible,
  getAppWindow,
  readNativeWindowSnapshot,
  restorePersistedWindowState,
  savePersistedWindowState,
} from '@/window/native';

interface WindowProviderProps {
  children: ReactNode;
}

export function WindowProvider({ children }: WindowProviderProps) {
  const setIsTauri = useWindowStore((state) => state.setIsTauri);
  const hydrateFromNative = useWindowStore((state) => state.hydrateFromNative);
  const setMaximized = useWindowStore((state) => state.setMaximized);
  const setMinimized = useWindowStore((state) => state.setMinimized);
  const setFocused = useWindowStore((state) => state.setFocused);
  const setSize = useWindowStore((state) => state.setSize);
  const setScaleFactor = useWindowStore((state) => state.setScaleFactor);

  useWindowShortcuts();

  useEffect(() => {
    const isTauri = detectTauriRuntime();
    setIsTauri(isTauri);

    if (!isTauri) {
      return;
    }

    let disposed = false;
    const unlisteners: Array<() => void> = [];

    const bootstrap = async () => {
      try {
        await restorePersistedWindowState();
      } catch {
        // Ignore corrupt window-state payloads.
      }
      await ensureWindowConstraints();
      await ensureWindowVisible();

      const snapshot = await readNativeWindowSnapshot();
      if (disposed) {
        return;
      }

      hydrateFromNative({
        isTauri: true,
        isMaximized: snapshot.isMaximized,
        isMinimized: snapshot.isMinimized,
        isFocused: snapshot.isFocused,
        width: snapshot.width,
        height: snapshot.height,
        scaleFactor: snapshot.scaleFactor,
      });

      const current = await getAppWindow();

      unlisteners.push(
        await current.onResized(async ({ payload }) => {
          const factor = await current.scaleFactor();
          setSize(Math.round(payload.width / factor), Math.round(payload.height / factor));
          setScaleFactor(factor);
          setMaximized(await current.isMaximized());
          setMinimized(await current.isMinimized());
        }),
      );

      unlisteners.push(
        await current.onMoved(async () => {
          setMaximized(await current.isMaximized());
        }),
      );

      unlisteners.push(
        await current.onFocusChanged(({ payload: focused }) => {
          setFocused(focused);
        }),
      );

      const syncFlags = () => {
        void (async () => {
          setMaximized(await current.isMaximized());
          setMinimized(await current.isMinimized());
        })();
      };

      window.addEventListener('focus', syncFlags);
      unlisteners.push(() => {
        window.removeEventListener('focus', syncFlags);
      });

      const onVisibility = () => {
        void (async () => {
          setMinimized(await current.isMinimized());
          if (document.visibilityState === 'hidden') {
            await savePersistedWindowState();
          }
        })();
      };

      document.addEventListener('visibilitychange', onVisibility);
      unlisteners.push(() => {
        document.removeEventListener('visibilitychange', onVisibility);
      });
    };

    void bootstrap();

    return () => {
      disposed = true;
      for (const unlisten of unlisteners) {
        unlisten();
      }
      void savePersistedWindowState();
    };
  }, [
    hydrateFromNative,
    setFocused,
    setIsTauri,
    setMaximized,
    setMinimized,
    setScaleFactor,
    setSize,
  ]);

  return children;
}
