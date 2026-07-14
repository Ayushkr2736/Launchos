import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CommandPaletteAgent } from '@/features/command-palette/types';

import { AGENTS_STORAGE_KEY, DEFAULT_AGENTS } from '@/features/command-palette/constants';

export interface AgentStoreState {
  agents: CommandPaletteAgent[];
  activeAgentId: string;
  setActiveAgent: (agentId: string) => void;
  registerAgent: (agent: CommandPaletteAgent) => void;
  unregisterAgent: (agentId: string) => void;
}

export const useAgentStore = create<AgentStoreState>()(
  persist(
    (set, get) => ({
      agents: [...DEFAULT_AGENTS],
      activeAgentId: DEFAULT_AGENTS[0].id,
      setActiveAgent: (agentId) => {
        if (!get().agents.some((agent) => agent.id === agentId)) {
          return;
        }
        set({ activeAgentId: agentId });
      },
      registerAgent: (agent) => {
        const exists = get().agents.some((item) => item.id === agent.id);
        if (exists) {
          set({
            agents: get().agents.map((item) => (item.id === agent.id ? agent : item)),
          });
          return;
        }
        set({ agents: [...get().agents, agent] });
      },
      unregisterAgent: (agentId) => {
        const agents = get().agents.filter((agent) => agent.id !== agentId);
        if (agents.length === 0) {
          return;
        }
        const activeAgentId =
          get().activeAgentId === agentId
            ? (agents[0]?.id ?? get().activeAgentId)
            : get().activeAgentId;
        set({ agents, activeAgentId });
      },
    }),
    {
      name: AGENTS_STORAGE_KEY,
      partialize: (state) => ({
        activeAgentId: state.activeAgentId,
        agents: state.agents,
      }),
    },
  ),
);
