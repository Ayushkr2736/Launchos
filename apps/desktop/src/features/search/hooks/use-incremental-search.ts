import { useEffect, useRef } from 'react';

import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { SearchPatternError } from '@/features/search/lib/match-engine';
import { runWorkspaceSearch } from '@/features/search/lib/run-search';
import { SEARCH_DEBOUNCE_MS } from '@/features/search/types';
import { useProjectStore } from '@/stores/project-store';
import { useSearchStore } from '@/stores/search-store';

/**
 * Debounced incremental search against the active workspace FS.
 */
export function useIncrementalSearch(): void {
  const fs = useFileSystem();
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const query = useSearchStore((state) => state.query);
  const options = useSearchStore((state) => state.options);
  const setResults = useSearchStore((state) => state.setResults);
  const setStatus = useSearchStore((state) => state.setStatus);
  const setProgress = useSearchStore((state) => state.setProgress);
  const pushRecentSearch = useSearchStore((state) => state.pushRecentSearch);
  const clearResults = useSearchStore((state) => state.clearResults);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    abortRef.current?.abort();

    if (!workspacePath || !trimmed) {
      clearResults();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('searching');
    setProgress({ scannedFiles: 0, totalFiles: 0 });

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const results = await runWorkspaceSearch({
            fs,
            query: trimmed,
            options,
            workspaceKey: workspacePath,
            signal: controller.signal,
            onProgress: (scanned, total) => {
              if (!controller.signal.aborted) {
                setProgress({ scannedFiles: scanned, totalFiles: total });
              }
            },
          });
          if (controller.signal.aborted) {
            return;
          }
          setResults(results);
          pushRecentSearch(trimmed);
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }
          const message =
            error instanceof SearchPatternError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Search failed';
          setStatus('error', message);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    clearResults,
    fs,
    options,
    pushRecentSearch,
    query,
    setProgress,
    setResults,
    setStatus,
    workspacePath,
  ]);
}
