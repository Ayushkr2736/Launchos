/**
 * Canonical agent identifiers used across desktop, API, and services.
 */
export type AgentId = string & { readonly __brand: 'AgentId' };

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'stopped';

export type AgentCapability = 'chat' | 'code' | 'tool-use' | 'file-system' | 'browser' | 'memory';

export interface AgentDefinition {
  readonly id: AgentId;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly capabilities: readonly AgentCapability[];
  readonly status: AgentStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}
