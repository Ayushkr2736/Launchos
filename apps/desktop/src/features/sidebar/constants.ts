import {
  Banknote,
  Boxes,
  Code2,
  Database,
  FlaskConical,
  Globe2,
  Home,
  LayoutTemplate,
  Megaphone,
  Mic2,
  Settings,
  Store,
  UserRound,
} from 'lucide-react';

import type { SidebarNavItem, SidebarSectionId } from '@/types/shell';
import type { LucideIcon } from 'lucide-react';

export const SIDEBAR_EXPANDED_MIN = 180;
export const SIDEBAR_RECENT_MAX = 12;

export const SIDEBAR_ICONS: Record<SidebarSectionId, LucideIcon> = {
  home: Home,
  projects: Boxes,
  code: Code2,
  research: FlaskConical,
  browser: Globe2,
  design: LayoutTemplate,
  marketing: Megaphone,
  finance: Banknote,
  voice: Mic2,
  data: Database,
  marketplace: Store,
  settings: Settings,
  profile: UserRound,
};

/** Navigation chrome only — destinations, not domain data. */
export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  { id: 'home', label: 'Home', shortcut: 'G H' },
  {
    id: 'projects',
    label: 'Projects',
    shortcut: 'G P',
    children: [
      { id: 'projects.all', label: 'All projects', parentId: 'projects' },
      { id: 'projects.starred', label: 'Starred', parentId: 'projects' },
      { id: 'projects.templates', label: 'Templates', parentId: 'projects' },
    ],
  },
  {
    id: 'code',
    label: 'Code',
    shortcut: 'G C',
    children: [
      { id: 'code.editor', label: 'Editor', parentId: 'code' },
      { id: 'code.diff', label: 'Diff', parentId: 'code' },
      { id: 'code.snippets', label: 'Snippets', parentId: 'code' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    shortcut: 'G R',
    children: [
      { id: 'research.sources', label: 'Sources', parentId: 'research' },
      { id: 'research.notes', label: 'Notes', parentId: 'research' },
      { id: 'research.collections', label: 'Collections', parentId: 'research' },
    ],
  },
  {
    id: 'browser',
    label: 'Browser',
    shortcut: 'G B',
    children: [
      { id: 'browser.tabs', label: 'Tabs', parentId: 'browser' },
      { id: 'browser.bookmarks', label: 'Bookmarks', parentId: 'browser' },
      { id: 'browser.history', label: 'History', parentId: 'browser' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    shortcut: 'G D',
    children: [
      { id: 'design.boards', label: 'Boards', parentId: 'design' },
      { id: 'design.assets', label: 'Assets', parentId: 'design' },
      { id: 'design.components', label: 'Components', parentId: 'design' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    shortcut: 'G M',
    children: [
      { id: 'marketing.campaigns', label: 'Campaigns', parentId: 'marketing' },
      { id: 'marketing.content', label: 'Content', parentId: 'marketing' },
      { id: 'marketing.analytics', label: 'Analytics', parentId: 'marketing' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    shortcut: 'G F',
    children: [
      { id: 'finance.overview', label: 'Overview', parentId: 'finance' },
      { id: 'finance.invoices', label: 'Invoices', parentId: 'finance' },
      { id: 'finance.reports', label: 'Reports', parentId: 'finance' },
    ],
  },
  {
    id: 'voice',
    label: 'Voice',
    shortcut: 'G V',
    children: [
      { id: 'voice.sessions', label: 'Sessions', parentId: 'voice' },
      { id: 'voice.transcripts', label: 'Transcripts', parentId: 'voice' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    shortcut: 'G A',
    children: [
      { id: 'data.datasets', label: 'Datasets', parentId: 'data' },
      { id: 'data.pipelines', label: 'Pipelines', parentId: 'data' },
      { id: 'data.queries', label: 'Queries', parentId: 'data' },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    shortcut: 'G K',
    children: [
      { id: 'marketplace.browse', label: 'Browse', parentId: 'marketplace' },
      { id: 'marketplace.installed', label: 'Installed', parentId: 'marketplace' },
      { id: 'marketplace.updates', label: 'Updates', parentId: 'marketplace' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    shortcut: 'G ,',
    children: [
      { id: 'settings.general', label: 'General', parentId: 'settings' },
      { id: 'settings.appearance', label: 'Appearance', parentId: 'settings' },
      { id: 'settings.shortcuts', label: 'Shortcuts', parentId: 'settings' },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    shortcut: 'G U',
    children: [
      { id: 'profile.account', label: 'Account', parentId: 'profile' },
      { id: 'profile.preferences', label: 'Preferences', parentId: 'profile' },
    ],
  },
] as const;
