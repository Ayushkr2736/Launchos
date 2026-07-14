import { AlertTriangle, FileCode2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { EditorSavePayload, EditorViewStateSnapshot } from '@/modules/editor';
import type { EditorRevealTarget } from '@/stores/editor-reveal-store';
import type { WorkspaceTab } from '@/types/shell';

import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { Editor, EditorBinaryState, contentLooksBinary, isBinaryFilePath } from '@/modules/editor';
import { useEditorRevealStore } from '@/stores/editor-reveal-store';
import { useEditorViewStateStore } from '@/stores/editor-view-state-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

interface WorkspaceEditorSurfaceProps {
  tab: WorkspaceTab;
  readOnly?: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function resolveTabPath(tab: WorkspaceTab): string | undefined {
  if (tab.path) {
    return tab.path;
  }
  if (tab.kind === 'file') {
    return tab.id;
  }
  return undefined;
}

/**
 * Workspace bridge: loads file content from the active FileSystemProvider,
 * persists via autosave, and restores Monaco cursor/scroll view state.
 */
export function WorkspaceEditorSurface({ tab, readOnly = false }: WorkspaceEditorSurfaceProps) {
  const setTabDirty = useWorkspaceStore((state) => state.setTabDirty);
  const fs = useFileSystem();
  const path = resolveTabPath(tab);
  const setViewState = useEditorViewStateStore((state) => state.setViewState);
  const initialViewState = useEditorViewStateStore((state) => state.byId[tab.id] ?? null);
  const pendingReveal = useEditorRevealStore((state) => state.pending);
  const consumeReveal = useEditorRevealStore((state) => state.consumeReveal);

  const [buffer, setBuffer] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [binary, setBinary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [revealTarget, setRevealTarget] = useState<EditorRevealTarget | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const loadGeneration = useRef(0);

  useEffect(() => {
    if (!path || !pendingReveal || pendingReveal.path !== path) {
      return;
    }
    const target = consumeReveal(path);
    if (target) {
      setRevealTarget(target);
    }
  }, [consumeReveal, path, pendingReveal]);

  useEffect(() => {
    const generation = ++loadGeneration.current;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setLoadError(null);
      setSaveStatus('idle');

      if (tab.kind === 'untitled' || !path) {
        if (!cancelled && generation === loadGeneration.current) {
          setBinary(false);
          setBuffer('');
          setLoading(false);
        }
        return;
      }

      if (isBinaryFilePath(path)) {
        if (!cancelled && generation === loadGeneration.current) {
          setBinary(true);
          setBuffer('');
          setLoading(false);
        }
        return;
      }

      try {
        const content = await fs.readFileContent(path);
        if (cancelled || generation !== loadGeneration.current) {
          return;
        }
        if (contentLooksBinary(content)) {
          setBinary(true);
          setBuffer('');
        } else {
          setBinary(false);
          setBuffer(content);
        }
      } catch (error) {
        if (cancelled || generation !== loadGeneration.current) {
          return;
        }
        setLoadError(error instanceof Error ? error.message : 'Failed to open file');
        setBuffer('');
        setBinary(false);
      } finally {
        if (!cancelled && generation === loadGeneration.current) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [fs, path, tab.id, tab.kind]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (payload: { value: string }) => {
      setBuffer(payload.value);
      setSaveStatus('idle');
      if (!tab.dirty) {
        setTabDirty(tab.id, true);
      }
    },
    [setTabDirty, tab.dirty, tab.id],
  );

  const handleAutosave = useCallback(
    async (payload: EditorSavePayload) => {
      if (!path || tab.kind === 'untitled' || binary || readOnly || tab.kind === 'preview') {
        return;
      }
      setSaveStatus('saving');
      try {
        await fs.writeFileContent(path, payload.value);
        setTabDirty(tab.id, false);
        setSaveStatus('saved');
        if (saveTimerRef.current !== null) {
          window.clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = window.setTimeout(() => {
          setSaveStatus('idle');
        }, 1600);
      } catch (error) {
        setSaveStatus('error');
        console.warn('[editor] autosave failed', error);
      }
    },
    [binary, fs, path, readOnly, setTabDirty, tab.id, tab.kind],
  );

  const handleViewStateChange = useCallback(
    (state: EditorViewStateSnapshot | null) => {
      setViewState(tab.id, state);
    },
    [setViewState, tab.id],
  );

  const displayPath = path ?? tab.title;
  const editorReadOnly = readOnly || tab.kind === 'preview';

  return (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="border-border text-muted-foreground flex h-8 shrink-0 items-center gap-2 border-b px-3 text-xs">
        <FileCode2 className="h-3.5 w-3.5" aria-hidden />
        <span className="truncate">{displayPath}</span>
        {tab.dirty ? <span className="text-primary">•</span> : null}
        <span className="ml-auto flex items-center gap-2 uppercase tracking-wide">
          {saveStatus === 'saving' ? <span>Saving…</span> : null}
          {saveStatus === 'saved' ? (
            <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
          ) : null}
          {saveStatus === 'error' ? <span className="text-destructive">Save failed</span> : null}
          {editorReadOnly ? <span>Read-only</span> : null}
          {binary ? <span>Binary</span> : null}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        {loadError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <AlertTriangle className="text-destructive h-5 w-5" aria-hidden />
            <p className="text-foreground text-sm font-medium">Could not open file</p>
            <p className="text-muted-foreground max-w-sm text-sm">{loadError}</p>
          </div>
        ) : binary ? (
          <EditorBinaryState fileName={tab.title} />
        ) : (
          <Editor
            id={tab.id}
            value={buffer}
            {...(path !== undefined ? { path } : {})}
            readOnly={editorReadOnly}
            loading={loading}
            themeMode="system"
            autosave={Boolean(path) && tab.kind !== 'untitled' && !editorReadOnly}
            initialViewState={initialViewState}
            revealTarget={revealTarget}
            onChange={handleChange}
            onSave={(payload) => {
              void handleAutosave(payload);
            }}
            onViewStateChange={handleViewStateChange}
          />
        )}
      </div>
    </div>
  );
}
