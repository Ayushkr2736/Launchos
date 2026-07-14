import { confirm } from '@tauri-apps/plugin-dialog';
import { useCallback } from 'react';

import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { SearchPatternError } from '@/features/search/lib/match-engine';
import {
  countReplacementsInResults,
  runWorkspaceReplaceAll,
} from '@/features/search/lib/run-replace';
import { runWorkspaceSearch } from '@/features/search/lib/run-search';
import { useProjectStore } from '@/stores/project-store';
import { useSearchStore } from '@/stores/search-store';

export function useSearchReplace() {
  const fs = useFileSystem();
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const query = useSearchStore((state) => state.query);
  const replaceQuery = useSearchStore((state) => state.replaceQuery);
  const options = useSearchStore((state) => state.options);
  const results = useSearchStore((state) => state.results);
  const setReplaceStatus = useSearchStore((state) => state.setReplaceStatus);
  const setLastReplace = useSearchStore((state) => state.setLastReplace);
  const setResults = useSearchStore((state) => state.setResults);
  const setStatus = useSearchStore((state) => state.setStatus);
  const setProgress = useSearchStore((state) => state.setProgress);

  const pendingCount = countReplacementsInResults(results);

  const replaceAll = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || !options.searchContent || pendingCount === 0) {
      return;
    }

    const fileCount = results.filter((file) => file.matches.length > 0).length;
    const message = `Replace ${pendingCount} occurrence${pendingCount === 1 ? '' : 's'} across ${fileCount} file${fileCount === 1 ? '' : 's'}?`;
    let ok = false;
    try {
      ok = await confirm(message, { title: 'Replace All', kind: 'warning' });
    } catch {
      ok = window.confirm(message);
    }
    if (!ok) {
      return;
    }

    setReplaceStatus('replacing', 'Replacing…');
    try {
      const paths = results.filter((file) => file.matches.length > 0).map((file) => file.path);
      const result = await runWorkspaceReplaceAll({
        fs,
        query: trimmed,
        replacement: replaceQuery,
        options,
        paths,
      });
      setLastReplace(result);
      setReplaceStatus(
        'done',
        `Replaced ${result.replacements} in ${result.filesChanged} file${result.filesChanged === 1 ? '' : 's'}`,
      );

      setStatus('searching');
      setProgress({ scannedFiles: 0, totalFiles: 0 });
      const nextResults = await runWorkspaceSearch({
        fs,
        query: trimmed,
        options,
        workspaceKey: workspacePath ?? 'default',
        onProgress: (scanned, total) => {
          setProgress({ scannedFiles: scanned, totalFiles: total });
        },
      });
      setResults(nextResults);
    } catch (error) {
      const message =
        error instanceof SearchPatternError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Replace failed';
      setReplaceStatus('error', message);
    }
  }, [
    fs,
    options,
    pendingCount,
    query,
    replaceQuery,
    results,
    setLastReplace,
    setProgress,
    setReplaceStatus,
    setResults,
    setStatus,
    workspacePath,
  ]);

  return {
    pendingCount,
    replaceAll,
  };
}
