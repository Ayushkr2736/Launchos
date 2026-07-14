/* eslint-disable import/default -- Vite `?worker` modules expose a Worker constructor as default */
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
/* eslint-enable import/default */

let configured = false;

/**
 * Configure Monaco to use Vite-bundled workers (required for Tauri / offline).
 * Safe to call multiple times.
 */
export function configureMonaco(): void {
  if (configured || typeof window === 'undefined') {
    return;
  }
  configured = true;

  window.MonacoEnvironment = {
    getWorker(_workerId: string, label: string): Worker {
      if (label === 'json') {
        return new JsonWorker();
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new CssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new HtmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new TsWorker();
      }
      return new EditorWorker();
    },
  };

  loader.config({ monaco });
}

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (workerId: string, label: string) => Worker;
    };
  }
}
