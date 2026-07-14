import { cn } from '@launchos/ui';
import { useEffect, useState } from 'react';

import type {
  EditorChangePayload,
  EditorLanguage,
  EditorSavePayload,
  EditorThemeMode,
} from '@/features/editor/types';
import type { EditorRevealTarget } from '@/stores/editor-reveal-store';
import type { EditorViewStateSnapshot } from '@/stores/editor-view-state-store';

import { EditorEmptyState } from '@/features/editor/atoms/editor-empty-state';
import { EditorLoadingState } from '@/features/editor/atoms/editor-loading-state';
import { useEditorAutosave } from '@/features/editor/hooks/use-editor-autosave';
import { useEditorTheme } from '@/features/editor/hooks/use-editor-theme';
import { resolveEditorLanguage } from '@/features/editor/languages';
import { MonacoEditorView } from '@/features/editor/organisms/monaco-editor';

export interface EditorProps {
  /** Stable document id (typically the workspace tab id). */
  id: string;
  value: string;
  path?: string;
  language?: EditorLanguage;
  themeMode?: EditorThemeMode;
  readOnly?: boolean;
  /** When true, shows the editor empty state instead of Monaco. */
  empty?: boolean;
  /** External loading (e.g. fetching document contents). */
  loading?: boolean;
  className?: string;
  initialViewState?: EditorViewStateSnapshot | null;
  revealTarget?: EditorRevealTarget | null;
  /** Debounced autosave callback — UI hook only; caller owns persistence. */
  onSave?: (payload: EditorSavePayload) => void;
  onChange?: (payload: EditorChangePayload) => void;
  onViewStateChange?: (state: EditorViewStateSnapshot | null) => void;
  /** Disable autosave debounce even if `onSave` is provided. */
  autosave?: boolean;
}

/**
 * Reusable LaunchOS code editor.
 * Composes Monaco with theme sync, autosave hook, and empty/loading chrome.
 */
export function Editor({
  id,
  value,
  path,
  language: languageProp,
  themeMode = 'system',
  readOnly = false,
  empty = false,
  loading = false,
  className,
  initialViewState = null,
  revealTarget = null,
  onSave,
  onChange,
  onViewStateChange,
  autosave = true,
}: EditorProps) {
  const theme = useEditorTheme(themeMode);
  const language = resolveEditorLanguage(path, languageProp);
  const [monacoReady, setMonacoReady] = useState(false);

  useEffect(() => {
    setMonacoReady(false);
  }, [id]);

  useEditorAutosave({
    id,
    value,
    ...(path !== undefined ? { path } : {}),
    enabled: autosave && !readOnly && !empty && !loading,
    ...(onSave ? { onSave } : {}),
  });

  const showLoading = loading || (!empty && !monacoReady);

  return (
    <div
      className={cn('relative flex h-full min-h-0 w-full flex-col overflow-hidden', className)}
      data-editor-id={id}
      data-editor-language={language}
    >
      {empty ? (
        <EditorEmptyState />
      ) : (
        <>
          {showLoading ? (
            <div className="bg-background absolute inset-0 z-10">
              <EditorLoadingState />
            </div>
          ) : null}
          <div className={cn('min-h-0 flex-1', showLoading && 'invisible')}>
            <MonacoEditorView
              key={id}
              value={value}
              language={language}
              theme={theme}
              path={path ?? id}
              readOnly={readOnly}
              initialViewState={initialViewState}
              revealTarget={revealTarget}
              onReady={() => {
                setMonacoReady(true);
              }}
              onChange={(next) => {
                onChange?.({ id, value: next, ...(path !== undefined ? { path } : {}) });
              }}
              {...(onViewStateChange ? { onViewStateChange } : {})}
            />
          </div>
        </>
      )}
    </div>
  );
}
