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
let languageDefaultsConfigured = false;

/**
 * Configure Monaco for Vite + Tauri (bundled workers, no CDN).
 * Safe to call multiple times.
 */
export function configureMonaco(): void {
  if (configured || typeof window === 'undefined') {
    return;
  }
  configured = true;

  window.MonacoEnvironment = {
    getWorker(_workerId: string, label: string): Worker {
      switch (label) {
        case 'json':
          return new JsonWorker();
        case 'css':
        case 'scss':
        case 'less':
          return new CssWorker();
        case 'html':
        case 'handlebars':
        case 'razor':
          return new HtmlWorker();
        case 'typescript':
        case 'javascript':
          return new TsWorker();
        default:
          return new EditorWorker();
      }
    },
  };

  loader.config({ monaco });
}

/**
 * Apply TS/JS compiler defaults (JSX, module resolution) once Monaco is ready.
 * Uses the Monaco 0.55+ top-level `monaco.typescript` namespace.
 */
export function configureLanguageDefaults(monacoApi: typeof monaco): void {
  if (languageDefaultsConfigured) {
    return;
  }
  languageDefaultsConfigured = true;

  const compilerOptions = {
    target: monacoApi.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monacoApi.typescript.ModuleResolutionKind.NodeJs,
    module: monacoApi.typescript.ModuleKind.ESNext,
    jsx: monacoApi.typescript.JsxEmit.ReactJSX,
    allowJs: true,
    checkJs: false,
    esModuleInterop: true,
  };

  monacoApi.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
  monacoApi.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);

  monacoApi.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monacoApi.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
}

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: (workerId: string, label: string) => Worker;
    };
  }
}
