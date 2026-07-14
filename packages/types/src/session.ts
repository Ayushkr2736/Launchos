import type { AgentId } from './agent.js';

export type SessionId = string & { readonly __brand: 'SessionId' };

export type SessionStatus = 'active' | 'archived' | 'failed';

export interface SessionMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system' | 'tool';
  readonly content: string;
  readonly createdAt: string;
}

export interface SessionSummary {
  readonly id: SessionId;
  readonly agentId: AgentId;
  readonly title: string;
  readonly status: SessionStatus;
  readonly messageCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
