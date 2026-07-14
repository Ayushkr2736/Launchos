# Desktop Window Manager

Custom undecorated Tauri chrome with native window APIs.

## Features

- Minimize / maximize / restore / close
- Double-click drag region to toggle maximize
- `data-tauri-drag-region` title bar dragging
- Edge resize handles when not maximized
- State persistence via `tauri-plugin-window-state`
- Zustand mirror for UI (`isMaximized`, size, focus)
- Shortcuts: `⌘M` minimize, `⌘⇧M` maximize, `⌘⇧W` close

## macOS notes

Undecorated windows can paint as an empty black frame if:

- window-state restores `visible: false` or a tiny size
- the webview has no immediate background color

LaunchOS sets an opaque `backgroundColor`, excludes visibility from window-state flags,
forces `show()` + `setFocus()` on boot, and paints `#121212` in `index.html` before React loads.

## Structure

```text
src/window/
  components/   WindowControls, WindowDragRegion, WindowResizeHandles
  native.ts     Tauri API wrappers
  constants.ts
  styles/
src/providers/window-provider.tsx
src/hooks/use-window-manager.ts
src/stores/window-store.ts
```
