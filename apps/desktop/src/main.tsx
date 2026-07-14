import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { AppProviders } from './providers/app-providers';
import { useThemeStore } from './stores/theme-store';
import { applyResolvedTheme, resolveTheme } from './theme/apply-theme';

import '@launchos/ui/styles/globals.css';
import './theme/styles/theme.css';
import './window/styles/window.css';
import './layout/styles/layout.css';
import './modules/editor/styles/editor.css';
import './features/workspace/styles/workspace.css';
import './features/editor/styles/editor.css';
import './features/bottom-panel/styles/bottom-panel.css';
import './features/terminal/styles/terminal.css';
import './styles/shell.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

applyResolvedTheme(resolveTheme(useThemeStore.getState().mode));

useThemeStore.persist.onFinishHydration((state) => {
  applyResolvedTheme(resolveTheme(state.mode));
});

if (useThemeStore.persist.hasHydrated()) {
  applyResolvedTheme(resolveTheme(useThemeStore.getState().mode));
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
