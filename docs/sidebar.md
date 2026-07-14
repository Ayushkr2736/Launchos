# Sidebar

Production navigation chrome for LaunchOS. Layout and navigation state only — no domain logic.

## Sections

Home · Projects · Code · Research · Browser · Design · Marketing · Finance · Voice · Data · Marketplace · Settings · Profile

Nested destinations are declared under each section as chrome routes (e.g. Code → Editor / Diff / Snippets).

## Capabilities

| Feature          | Implementation                                                             |
| ---------------- | -------------------------------------------------------------------------- |
| Resizable        | Drag handle + ←/→ when focused (`SIDEBAR_EXPANDED_MIN`–`SIDEBAR_SIZE.max`) |
| Collapsible      | Layout store `⌘B`; icon rail when collapsed                                |
| Persistent       | Zustand `launchos.shell.sidebar` + layout width                            |
| Icons            | Lucide map in `features/sidebar/constants.ts`                              |
| Nested items     | Expandable tree with animate height                                        |
| Search           | Filters sections + children; `/` focuses search                            |
| Recent projects  | Persisted list, context menu, clear                                        |
| Hover animations | Framer Motion scale / slide                                                |
| Context menu     | Open, pin, expand/collapse, remove recent                                  |
| Keyboard         | ↑↓ Home/End Enter Space ←→ Escape `/`                                      |
| Accessibility    | `role="tree"`, `aria-*`, tooltips when collapsed, focus sync               |
| Dark theme       | `bg-sidebar` / `sidebar-foreground` tokens                                 |

## Structure

```text
features/sidebar/
  atoms/sidebar-resize-handle.tsx
  molecules/
    sidebar-header.tsx
    sidebar-search.tsx
    sidebar-item.tsx
    sidebar-nested-item.tsx
    sidebar-recent.tsx
    sidebar-profile.tsx
  hooks/
    use-sidebar-navigation.ts
    use-sidebar-resize.ts
  constants.ts
  sidebar.tsx
```

## Store API

```ts
useSidebarStore.getState().setActiveSection('code', 'code.diff');
useSidebarStore.getState().addRecentProject({ id, name, path? });
useSidebarStore.getState().togglePinned('projects');
```
