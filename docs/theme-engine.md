# Theme Engine

LaunchOS theme is driven by CSS variables, applied via a Zustand-backed mode store, and consumed by Tailwind utilities.

## Flow

```text
ThemeStore (persist mode)
  → ThemeProvider (resolve + apply DOM class/data-theme)
  → theme.css (:root / .dark CSS variables)
  → Tailwind hsl(var(--token))
  → All components
```

## Modes

- `light` — force light tokens
- `dark` — force dark tokens
- `system` — follow `prefers-color-scheme`

## Public API

- `ThemeProvider` — mounts theme application + system listener
- `useTheme()` — mode, resolved, setters, cycle
- `useThemeStore` — persisted Zustand store
- `ThemeToggle` — title-bar control with motion
