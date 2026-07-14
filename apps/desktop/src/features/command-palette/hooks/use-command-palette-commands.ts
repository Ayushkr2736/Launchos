import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bot,
  Columns2,
  Download,
  FileText,
  FolderOpen,
  FolderTree,
  FolderX,
  GitBranch,
  GitCommitHorizontal,
  Keyboard,
  LayoutTemplate,
  Monitor,
  Moon,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Pin,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Sun,
  Terminal,
  X,
} from 'lucide-react';
import { useMemo } from 'react';

import type { CommandPaletteItem } from '@/features/command-palette/types';
import type { ThemeMode } from '@/theme/types';

import { runAndClose } from '@/features/command-palette/lib/palette-actions';
import {
  requestReplaceInputFocus,
  requestSearchInputFocus,
} from '@/features/search/hooks/use-search-shortcut';
import { SIDEBAR_ICONS, SIDEBAR_NAV_ITEMS } from '@/features/sidebar/constants';
import { tabCommands } from '@/features/workspace/services/tab-commands';
import { layoutPanelApi } from '@/layout/panel-api';
import { useFilesystemStore } from '@/modules/filesystem';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager';
import { useAgentStore } from '@/stores/agent-store';
import { useCommandRegistry } from '@/stores/command-registry-store';
import { useGitStore } from '@/stores/git-store';
import { useLayoutStore } from '@/stores/layout-store';
import { useProjectStore } from '@/stores/project-store';
import { useRecentFilesStore } from '@/stores/recent-files-store';
import { useSearchStore } from '@/stores/search-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useTerminalStore } from '@/stores/terminal-store';
import { useThemeStore } from '@/stores/theme-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

/**
 * Built-in Cursor-like command packs + registered extensions.
 * Open File items come from `useOpenFileCommands` and are merged by the palette root.
 */
export function useCommandPaletteCommands(): CommandPaletteItem[] {
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);
  const setMode = useThemeStore((state) => state.setMode);
  const mode = useThemeStore((state) => state.mode);
  const toggleSplit = useWorkspaceStore((state) => state.toggleSplit);
  const resetWorkspace = useWorkspaceStore((state) => state.resetWorkspace);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const openTab = useWorkspaceStore((state) => state.openTab);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const agents = useAgentStore((state) => state.agents);
  const activeAgentId = useAgentStore((state) => state.activeAgentId);
  const setActiveAgent = useAgentStore((state) => state.setActiveAgent);
  const recentFiles = useRecentFilesStore((state) => state.files);
  const resetLayout = useLayoutStore((state) => state.resetLayout);
  const setAiPanelVisible = useLayoutStore((state) => state.setAiPanelVisible);
  const setAiPanelTab = useLayoutStore((state) => state.setAiPanelTab);
  const setLeftPanelTab = useLayoutStore((state) => state.setLeftPanelTab);
  const expandBottomPanel = useLayoutStore((state) => state.expandBottomPanel);
  const setBottomPanelTab = useLayoutStore((state) => state.setBottomPanelTab);
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const openWorkspace = useWorkspaceManagerStore((state) => state.openWorkspace);
  const closeWorkspace = useWorkspaceManagerStore((state) => state.closeWorkspace);
  const restoreLastWorkspace = useWorkspaceManagerStore((state) => state.restoreLastWorkspace);
  const switchWorkspace = useWorkspaceManagerStore((state) => state.switchWorkspace);
  const pinWorkspace = useWorkspaceManagerStore((state) => state.pinWorkspace);
  const recentWorkspaces = useWorkspaceManagerStore((state) => state.recents);
  const pinnedWorkspaces = useWorkspaceManagerStore((state) => state.pinned);
  const openNativeFile = useFilesystemStore((state) => state.openFile);
  const createTerminalSession = useTerminalStore((state) => state.createSession);
  const clearTerminal = useTerminalStore((state) => state.clearActive);
  const gitRefresh = useGitStore((state) => state.refresh);
  const gitFetch = useGitStore((state) => state.fetch);
  const gitPull = useGitStore((state) => state.pull);
  const gitPush = useGitStore((state) => state.push);
  const gitStageAll = useGitStore((state) => state.stageAll);
  const gitCommit = useGitStore((state) => state.commit);
  const gitSetView = useGitStore((state) => state.setView);
  const gitLoadHistory = useGitStore((state) => state.loadHistory);
  const gitLoadStashes = useGitStore((state) => state.loadStashes);
  const gitStashPush = useGitStore((state) => state.stashPush);
  const gitSetCloneOpen = useGitStore((state) => state.setCloneOpen);
  const registrations = useCommandRegistry((state) => state.registrations);

  return useMemo(() => {
    const navigation: CommandPaletteItem[] = SIDEBAR_NAV_ITEMS.flatMap((item) => {
      const Icon = SIDEBAR_ICONS[item.id];
      const top: CommandPaletteItem = {
        id: `nav.${item.id}`,
        group: 'navigation',
        label: `Go to ${item.label}`,
        keywords: ['navigate', 'go', item.label, item.id],
        ...(item.shortcut !== undefined ? { shortcut: item.shortcut } : {}),
        icon: Icon,
        run: runAndClose(() => {
          setActiveSection(item.id);
        }),
      };
      const children =
        item.children?.map((child) => ({
          id: `nav.${child.id}`,
          group: 'navigation' as const,
          label: `${item.label}: ${child.label}`,
          keywords: ['navigate', 'go', item.label, child.label, child.id],
          icon: Icon,
          run: runAndClose(() => {
            setActiveSection(item.id, child.id);
          }),
        })) ?? [];
      return [top, ...children];
    });

    const search: CommandPaletteItem[] = [
      {
        id: 'search.in-files',
        group: 'search',
        label: 'Search in Files',
        keywords: ['search', 'find', 'content', 'grep', 'global'],
        shortcut: '⌘⇧F',
        icon: Search,
        pinned: true,
        run: runAndClose(() => {
          layoutPanelApi.expand('explorer');
          setLeftPanelTab('search');
          setActiveSection('code');
          window.setTimeout(() => {
            requestSearchInputFocus();
          }, 0);
        }),
      },
      {
        id: 'search.replace-in-files',
        group: 'search',
        label: 'Replace in Files',
        keywords: ['search', 'replace', 'content', 'grep', 'global'],
        shortcut: '⌘⇧H',
        icon: Search,
        pinned: true,
        run: runAndClose(() => {
          layoutPanelApi.expand('explorer');
          setLeftPanelTab('search');
          setActiveSection('code');
          useSearchStore.getState().setReplaceOpen(true);
          window.setTimeout(() => {
            requestReplaceInputFocus();
          }, 0);
        }),
      },
    ];

    const commands: CommandPaletteItem[] = [
      {
        id: 'cmd.toggle-sidebar',
        group: 'commands',
        label: 'Toggle Sidebar',
        keywords: ['layout', 'panel', 'sidebar'],
        shortcut: '⌘B',
        icon: PanelLeft,
        pinned: true,
        run: runAndClose(() => {
          layoutPanelApi.toggle('sidebar');
        }),
      },
      {
        id: 'cmd.toggle-explorer',
        group: 'commands',
        label: 'Toggle Explorer',
        keywords: ['layout', 'files', 'explorer'],
        shortcut: '⌘⇧E',
        icon: FolderTree,
        pinned: true,
        run: runAndClose(() => {
          layoutPanelApi.toggle('explorer');
        }),
      },
      {
        id: 'cmd.toggle-ai',
        group: 'commands',
        label: 'Toggle AI Panel',
        keywords: ['layout', 'assistant', 'chat'],
        shortcut: '⌘⇧A',
        icon: PanelRight,
        pinned: true,
        run: runAndClose(() => {
          layoutPanelApi.toggle('ai');
        }),
      },
      {
        id: 'cmd.toggle-bottom',
        group: 'commands',
        label: 'Toggle Bottom Panel',
        keywords: ['layout', 'terminal', 'panel'],
        shortcut: '⌘J',
        icon: PanelBottom,
        pinned: true,
        run: runAndClose(() => {
          layoutPanelApi.toggle('bottom');
        }),
      },
      {
        id: 'cmd.new-terminal',
        group: 'commands',
        label: 'New Terminal',
        keywords: ['terminal', 'shell', 'zsh', 'bash', 'pty'],
        shortcut: '⌘⇧`',
        icon: Terminal,
        pinned: true,
        run: runAndClose(() => {
          expandBottomPanel();
          setBottomPanelTab('terminal');
          createTerminalSession({ cwd: workspacePath });
        }),
      },
      {
        id: 'cmd.new-terminal-zsh',
        group: 'commands',
        label: 'New Terminal (zsh)',
        keywords: ['terminal', 'shell', 'zsh'],
        icon: Terminal,
        run: runAndClose(() => {
          expandBottomPanel();
          setBottomPanelTab('terminal');
          createTerminalSession({ cwd: workspacePath, shell: 'zsh' });
        }),
      },
      {
        id: 'cmd.new-terminal-bash',
        group: 'commands',
        label: 'New Terminal (bash)',
        keywords: ['terminal', 'shell', 'bash'],
        icon: Terminal,
        run: runAndClose(() => {
          expandBottomPanel();
          setBottomPanelTab('terminal');
          createTerminalSession({ cwd: workspacePath, shell: 'bash' });
        }),
      },
      {
        id: 'cmd.clear-terminal',
        group: 'commands',
        label: 'Clear Terminal',
        keywords: ['terminal', 'clear', 'reset'],
        shortcut: '⌘⇧K',
        icon: Terminal,
        run: runAndClose(() => {
          expandBottomPanel();
          setBottomPanelTab('terminal');
          clearTerminal();
        }),
      },
      {
        id: 'cmd.focus-ai-chat',
        group: 'commands',
        label: 'Focus AI Chat',
        keywords: ['assistant', 'chat', 'ai'],
        icon: Bot,
        run: runAndClose(() => {
          setAiPanelVisible(true);
          setAiPanelTab('chat');
        }),
      },
      {
        id: 'cmd.reset-layout',
        group: 'commands',
        label: 'Reset Layout',
        keywords: ['layout', 'reset', 'default'],
        icon: RotateCcw,
        run: runAndClose(() => {
          resetLayout();
        }),
      },
    ];

    const settingsItem = SIDEBAR_NAV_ITEMS.find((item) => item.id === 'settings');
    const settings: CommandPaletteItem[] = [
      {
        id: 'settings.open',
        group: 'settings',
        label: 'Open Settings',
        keywords: ['settings', 'preferences', 'options'],
        shortcut: 'G ,',
        icon: Settings,
        pinned: true,
        run: runAndClose(() => {
          setActiveSection('settings');
        }),
      },
      ...(settingsItem?.children?.map((child) => ({
        id: `settings.${child.id}`,
        group: 'settings' as const,
        label: `Settings: ${child.label}`,
        keywords: ['settings', child.label, child.id],
        icon: child.id.includes('shortcut') ? Keyboard : Settings,
        run: runAndClose(() => {
          setActiveSection('settings', child.id);
        }),
      })) ?? []),
    ];

    const themeModes: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
      { mode: 'light', label: 'Light Theme', icon: Sun },
      { mode: 'dark', label: 'Dark Theme', icon: Moon },
      { mode: 'system', label: 'System Theme', icon: Monitor },
    ];

    const theme: CommandPaletteItem[] = themeModes.map((entry) => ({
      id: `theme.${entry.mode}`,
      group: 'theme' as const,
      label: entry.label,
      keywords: ['theme', 'appearance', entry.mode],
      icon: entry.icon,
      pinned: true,
      ...(mode === entry.mode ? { hint: 'Active' } : {}),
      run: runAndClose(() => {
        setMode(entry.mode);
      }),
    }));

    const openGit = () => {
      expandBottomPanel();
      setBottomPanelTab('git');
    };

    const git: CommandPaletteItem[] = [
      {
        id: 'git.open',
        group: 'git',
        label: 'Open Source Control',
        keywords: ['git', 'scm', 'source control'],
        shortcut: '⌘⇧G',
        icon: GitBranch,
        pinned: true,
        run: runAndClose(openGit),
      },
      {
        id: 'git.refresh',
        group: 'git',
        label: 'Git: Refresh Status',
        keywords: ['git', 'status', 'refresh'],
        icon: RotateCcw,
        run: runAndClose(() => {
          openGit();
          if (workspacePath) {
            void gitRefresh(workspacePath);
          }
        }),
      },
      {
        id: 'git.stage-all',
        group: 'git',
        label: 'Git: Stage All Changes',
        keywords: ['git', 'stage', 'add'],
        icon: GitCommitHorizontal,
        run: runAndClose(() => {
          openGit();
          if (workspacePath) {
            void gitStageAll(workspacePath);
          }
        }),
      },
      {
        id: 'git.commit',
        group: 'git',
        label: 'Git: Commit',
        keywords: ['git', 'commit'],
        icon: GitCommitHorizontal,
        run: runAndClose(() => {
          openGit();
          if (workspacePath) {
            void gitCommit(workspacePath);
          }
        }),
      },
      {
        id: 'git.fetch',
        group: 'git',
        label: 'Git: Fetch',
        keywords: ['git', 'fetch', 'remote'],
        icon: Download,
        run: runAndClose(() => {
          openGit();
          if (workspacePath) {
            void gitFetch(workspacePath);
          }
        }),
      },
      {
        id: 'git.pull',
        group: 'git',
        label: 'Git: Pull',
        keywords: ['git', 'pull', 'sync'],
        icon: ArrowDownToLine,
        run: runAndClose(() => {
          openGit();
          if (workspacePath) {
            void gitPull(workspacePath);
          }
        }),
      },
      {
        id: 'git.push',
        group: 'git',
        label: 'Git: Push',
        keywords: ['git', 'push', 'sync'],
        icon: ArrowUpFromLine,
        run: runAndClose(() => {
          openGit();
          if (workspacePath) {
            void gitPush(workspacePath);
          }
        }),
      },
      {
        id: 'git.clone',
        group: 'git',
        label: 'Git: Clone Repository…',
        keywords: ['git', 'clone', 'remote'],
        icon: Download,
        run: runAndClose(() => {
          gitSetCloneOpen(true);
        }),
      },
      {
        id: 'git.history',
        group: 'git',
        label: 'Git: Show History',
        keywords: ['git', 'log', 'history', 'commits'],
        icon: GitCommitHorizontal,
        run: runAndClose(() => {
          openGit();
          gitSetView('history');
          if (workspacePath) {
            void gitLoadHistory(workspacePath);
          }
        }),
      },
      {
        id: 'git.stash',
        group: 'git',
        label: 'Git: Stash Changes',
        keywords: ['git', 'stash'],
        icon: GitCommitHorizontal,
        run: runAndClose(() => {
          openGit();
          gitSetView('stash');
          if (workspacePath) {
            void gitStashPush(workspacePath);
          }
        }),
      },
      {
        id: 'git.stash-view',
        group: 'git',
        label: 'Git: Show Stashes',
        keywords: ['git', 'stash', 'list'],
        icon: GitBranch,
        run: runAndClose(() => {
          openGit();
          gitSetView('stash');
          if (workspacePath) {
            void gitLoadStashes(workspacePath);
          }
        }),
      },
    ];

    const workspace: CommandPaletteItem[] = [
      {
        id: 'workspace.open-folder',
        group: 'workspace',
        label: 'Open Folder…',
        keywords: ['workspace', 'project', 'open', 'folder', 'directory', 'choose'],
        shortcut: '⌘O',
        icon: FolderOpen,
        pinned: true,
        run: () => {
          useLayoutStore.getState().setCommandPaletteOpen(false);
          void (async () => {
            const entry = await openWorkspace();
            if (!entry) {
              return;
            }
            setActiveSection('code');
          })();
        },
      },
      {
        id: 'workspace.open-file',
        group: 'workspace',
        label: 'Open File…',
        keywords: ['workspace', 'file', 'open', 'dialog', 'browse'],
        icon: FileText,
        pinned: true,
        run: () => {
          useLayoutStore.getState().setCommandPaletteOpen(false);
          void (async () => {
            const path = await openNativeFile({ title: 'Open File' });
            if (!path) {
              return;
            }
            const name = path.split(/[/\\]/).pop() ?? path;
            openTab({
              id: path,
              title: name,
              closable: true,
              kind: 'file',
              path,
            });
            useRecentFilesStore.getState().addRecentFile({
              id: path,
              name,
              path,
            });
            setActiveSection('code');
          })();
        },
      },
      {
        id: 'workspace.choose-folder',
        group: 'workspace',
        label: 'Choose Folder…',
        keywords: ['workspace', 'project', 'choose', 'select', 'folder', 'directory', 'browse'],
        icon: FolderOpen,
        run: () => {
          useLayoutStore.getState().setCommandPaletteOpen(false);
          void (async () => {
            const entry = await openWorkspace();
            if (!entry) {
              return;
            }
            setActiveSection('code');
          })();
        },
      },
      {
        id: 'workspace.restore-last',
        group: 'workspace',
        label: 'Restore Last Workspace',
        keywords: ['workspace', 'project', 'restore', 'last', 'reopen'],
        icon: RotateCcw,
        pinned: true,
        run: () => {
          useLayoutStore.getState().setCommandPaletteOpen(false);
          void (async () => {
            const entry = await restoreLastWorkspace();
            if (!entry) {
              return;
            }
            setActiveSection('code');
          })();
        },
      },
      {
        id: 'workspace.close-folder',
        group: 'workspace',
        label: 'Close Folder',
        keywords: ['workspace', 'project', 'close', 'folder'],
        icon: FolderX,
        run: runAndClose(() => {
          closeWorkspace();
        }),
      },
      ...(workspacePath
        ? [
            {
              id: 'workspace.pin-current',
              group: 'workspace' as const,
              label: 'Pin Current Workspace',
              keywords: ['workspace', 'pin', 'favorite'],
              icon: Pin,
              run: runAndClose(() => {
                pinWorkspace(workspacePath);
              }),
            },
          ]
        : []),
      ...pinnedWorkspaces.map((entry) => ({
        id: `workspace.pinned.${entry.id}`,
        group: 'workspace' as const,
        label: `Switch to ${entry.name}`,
        keywords: ['workspace', 'pinned', 'switch', entry.name, entry.path],
        icon: Pin,
        pinned: true,
        hint: entry.path,
        run: () => {
          useLayoutStore.getState().setCommandPaletteOpen(false);
          void (async () => {
            await switchWorkspace(entry.path);
            setActiveSection('code');
          })();
        },
      })),
      {
        id: 'workspace.toggle-split',
        group: 'workspace',
        label: 'Toggle Editor Split',
        keywords: ['workspace', 'split', 'editor'],
        icon: Columns2,
        shortcut: '⌘\\',
        run: runAndClose(() => {
          toggleSplit();
        }),
      },
      {
        id: 'workspace.close-tab',
        group: 'workspace',
        label: 'Close Active Tab',
        keywords: ['workspace', 'tab', 'close', 'editor'],
        icon: X,
        shortcut: '⌘W',
        run: runAndClose(() => {
          if (activeTabId) {
            void tabCommands.close(activeTabId);
          }
        }),
      },
      {
        id: 'workspace.close-others',
        group: 'workspace',
        label: 'Close Other Tabs',
        keywords: ['workspace', 'tab', 'close', 'others'],
        icon: X,
        shortcut: '⌘⌥T',
        run: runAndClose(() => {
          if (activeTabId) {
            void tabCommands.closeOthers(activeTabId);
          }
        }),
      },
      {
        id: 'workspace.close-left',
        group: 'workspace',
        label: 'Close Tabs to the Left',
        keywords: ['workspace', 'tab', 'close', 'left'],
        icon: X,
        run: runAndClose(() => {
          if (activeTabId) {
            void tabCommands.closeLeft(activeTabId);
          }
        }),
      },
      {
        id: 'workspace.close-right',
        group: 'workspace',
        label: 'Close Tabs to the Right',
        keywords: ['workspace', 'tab', 'close', 'right'],
        icon: X,
        run: runAndClose(() => {
          if (activeTabId) {
            void tabCommands.closeRight(activeTabId);
          }
        }),
      },
      {
        id: 'workspace.close-all',
        group: 'workspace',
        label: 'Close All Tabs',
        keywords: ['workspace', 'tab', 'close', 'all'],
        icon: X,
        shortcut: '⌘⌥W',
        run: runAndClose(() => {
          void tabCommands.closeAll();
        }),
      },
      {
        id: 'workspace.pin-tab',
        group: 'workspace',
        label: 'Toggle Pin Active Tab',
        keywords: ['workspace', 'tab', 'pin'],
        icon: Pin,
        shortcut: '⌘⌥P',
        run: runAndClose(() => {
          if (activeTabId) {
            tabCommands.pin(activeTabId);
          }
        }),
      },
      {
        id: 'workspace.duplicate-tab',
        group: 'workspace',
        label: 'Duplicate Active Tab',
        keywords: ['workspace', 'tab', 'duplicate', 'copy'],
        icon: FileText,
        shortcut: '⌘⇧D',
        run: runAndClose(() => {
          if (activeTabId) {
            tabCommands.duplicate(activeTabId);
          }
        }),
      },
      {
        id: 'workspace.reopen-closed',
        group: 'workspace',
        label: 'Reopen Closed Editor',
        keywords: ['workspace', 'tab', 'reopen', 'closed', 'undo'],
        icon: RotateCcw,
        shortcut: '⌘⇧T',
        run: runAndClose(() => {
          tabCommands.reopenClosed();
        }),
      },
      {
        id: 'workspace.reset',
        group: 'workspace',
        label: 'Reset Workspace',
        keywords: ['workspace', 'reset', 'clear'],
        icon: LayoutTemplate,
        run: runAndClose(() => {
          resetWorkspace();
        }),
      },
      ...tabs.map((tab): CommandPaletteItem => ({
        id: `workspace.tab.${tab.id}`,
        group: 'workspace',
        label: `Switch to ${tab.title}`,
        keywords: ['workspace', 'tab', 'switch', 'editor', tab.title, tab.path ?? ''],
        icon: FileText,
        hint: tab.dirty ? 'Unsaved' : (tab.path ?? tab.kind ?? 'editor'),
        run: runAndClose(() => {
          setActiveTab(tab.id);
          setActiveSection('code');
        }),
      })),
    ];

    const recent: CommandPaletteItem[] = recentFiles.map((file) => ({
      id: `recent.${file.id}`,
      group: 'recent-files' as const,
      label: file.name,
      keywords: ['recent', 'file', 'open', file.name, file.path],
      icon: FileText,
      hint: file.path,
      run: runAndClose(() => {
        openTab({ id: file.id, title: file.name, closable: true, kind: 'file', path: file.path });
        setActiveSection('code');
      }),
    }));

    const recentProjects: CommandPaletteItem[] = recentWorkspaces
      .filter((entry) => !pinnedWorkspaces.some((pinned) => pinned.id === entry.id))
      .slice(0, 12)
      .map((entry) => ({
        id: `recent-project.${entry.id}`,
        group: 'recent-projects' as const,
        label: entry.name,
        keywords: ['recent', 'project', 'workspace', 'switch', entry.name, entry.path],
        icon: FolderOpen,
        hint: entry.path,
        run: () => {
          useLayoutStore.getState().setCommandPaletteOpen(false);
          void (async () => {
            await switchWorkspace(entry.path);
            setActiveSection('code');
          })();
        },
      }));

    const agentsGroup: CommandPaletteItem[] = [
      ...agents.map((agent) => ({
        id: `agent.switch.${agent.id}`,
        group: 'agents' as const,
        label: `Switch to ${agent.name}`,
        keywords: ['agent', 'switch', 'action', agent.name, agent.description],
        icon: Bot,
        hint: activeAgentId === agent.id ? 'Active' : agent.description,
        pinned: true,
        run: runAndClose(() => {
          setActiveAgent(agent.id);
          setAiPanelVisible(true);
          setAiPanelTab('agent');
        }),
      })),
      {
        id: 'agent.new-chat',
        group: 'agents',
        label: 'New Agent Chat',
        keywords: ['agent', 'chat', 'new', 'action', 'future'],
        icon: Sparkles,
        hint: 'Coming soon',
        disabled: true,
        run: () => undefined,
      },
      {
        id: 'agent.run-task',
        group: 'agents',
        label: 'Run Agent Task…',
        keywords: ['agent', 'task', 'run', 'action', 'future'],
        icon: Sparkles,
        hint: 'Coming soon',
        disabled: true,
        run: () => undefined,
      },
      {
        id: 'agent.explain-selection',
        group: 'agents',
        label: 'Explain Selection',
        keywords: ['agent', 'explain', 'code', 'future'],
        icon: Sparkles,
        hint: 'Coming soon',
        disabled: true,
        run: () => undefined,
      },
      {
        id: 'agent.edit-with-instructions',
        group: 'agents',
        label: 'Edit with Instructions…',
        keywords: ['agent', 'edit', 'refactor', 'future'],
        icon: Sparkles,
        hint: 'Coming soon',
        disabled: true,
        run: () => undefined,
      },
      {
        id: 'agent.generate-tests',
        group: 'agents',
        label: 'Generate Tests',
        keywords: ['agent', 'test', 'generate', 'future'],
        icon: Sparkles,
        hint: 'Coming soon',
        disabled: true,
        run: () => undefined,
      },
    ];

    const registered = Object.values(registrations).flatMap((entry) => [...entry.items]);

    return [
      ...recent,
      ...recentProjects,
      ...search,
      ...navigation,
      ...commands,
      ...settings,
      ...theme,
      ...git,
      ...workspace,
      ...agentsGroup,
      ...registered,
    ];
  }, [
    activeAgentId,
    activeTabId,
    agents,
    closeWorkspace,
    createTerminalSession,
    clearTerminal,
    expandBottomPanel,
    gitCommit,
    gitFetch,
    gitPull,
    gitPush,
    gitRefresh,
    gitStageAll,
    gitSetView,
    gitLoadHistory,
    gitLoadStashes,
    gitStashPush,
    gitSetCloneOpen,
    mode,
    openTab,
    openNativeFile,
    openWorkspace,
    pinWorkspace,
    pinnedWorkspaces,
    recentFiles,
    recentWorkspaces,
    registrations,
    resetLayout,
    resetWorkspace,
    restoreLastWorkspace,
    setActiveAgent,
    setActiveSection,
    setActiveTab,
    setAiPanelTab,
    setAiPanelVisible,
    setBottomPanelTab,
    setLeftPanelTab,
    setMode,
    switchWorkspace,
    tabs,
    toggleSplit,
    workspacePath,
  ]);
}
