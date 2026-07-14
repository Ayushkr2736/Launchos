import { Bot, Brain, ListTodo, MessageSquare, Layers3 } from 'lucide-react';

import type { AiPanelTabId, ShellSlotId } from '@/types/shell';
import type { LucideIcon } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { ShellSlot } from '@/components/organisms/shell-slot';

const REGION_CONFIG: Record<
  AiPanelTabId,
  { slot: ShellSlotId; icon: LucideIcon; title: string; description: string }
> = {
  chat: {
    slot: 'ai.chat',
    icon: MessageSquare,
    title: 'Chat ready',
    description: 'Register a chat surface on slot ai.chat to render conversations here.',
  },
  agent: {
    slot: 'ai.agent',
    icon: Bot,
    title: 'Agent ready',
    description: 'Register an agent runtime surface on slot ai.agent.',
  },
  memory: {
    slot: 'ai.memory',
    icon: Brain,
    title: 'Memory ready',
    description: 'Register memory tooling on slot ai.memory.',
  },
  tasks: {
    slot: 'ai.tasks',
    icon: ListTodo,
    title: 'Tasks ready',
    description: 'Register task orchestration on slot ai.tasks.',
  },
  context: {
    slot: 'ai.context',
    icon: Layers3,
    title: 'Context ready',
    description: 'Register context inspectors on slot ai.context.',
  },
};

interface AiRegionProps {
  tab: AiPanelTabId;
}

export function AiRegion({ tab }: AiRegionProps) {
  const config = REGION_CONFIG[tab];

  return (
    <ShellSlot
      slot={config.slot}
      fallback={
        <EmptyState icon={config.icon} title={config.title} description={config.description} />
      }
    />
  );
}
