import type { EditorCommandApi } from '@/modules/editor/types';
import type { editor as MonacoEditorNS } from 'monaco-editor';

/**
 * Build an imperative command API bound to a live Monaco editor instance.
 * Uses Monaco's built-in actions (Find, Replace, Go to Line, Font Zoom, Fold).
 */
export function createEditorCommandApi(
  editor: MonacoEditorNS.IStandaloneCodeEditor,
): EditorCommandApi {
  const run = (actionId: string) => {
    const action = editor.getAction(actionId);
    if (action && action.isSupported()) {
      void action.run();
    }
  };

  return {
    find: () => {
      run('actions.find');
    },
    replace: () => {
      run('editor.action.startFindReplaceAction');
    },
    goToLine: () => {
      run('editor.action.gotoLine');
    },
    fontZoomIn: () => {
      run('editor.action.fontZoomIn');
    },
    fontZoomOut: () => {
      run('editor.action.fontZoomOut');
    },
    fontZoomReset: () => {
      run('editor.action.fontZoomReset');
    },
    foldAll: () => {
      run('editor.foldAll');
    },
    unfoldAll: () => {
      run('editor.unfoldAll');
    },
    focus: () => {
      editor.focus();
    },
    revealLine: (lineNumber, column = 1) => {
      editor.revealLineInCenter(lineNumber);
      editor.setPosition({ lineNumber, column });
      editor.focus();
    },
    getEditor: () => editor,
  };
}
