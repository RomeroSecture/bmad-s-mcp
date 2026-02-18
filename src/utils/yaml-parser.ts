import yaml from 'js-yaml';

export interface AgentMetadata {
  id: string;
  name: string;
  title: string;
  icon: string;
  module: string;
  hasSidecar: boolean;
}

export interface AgentMenuItem {
  trigger: string;
  exec?: string;
  workflow?: string;
  data?: string;
  description: string;
}

export interface AgentDefinition {
  metadata: AgentMetadata;
  persona: {
    role: string;
    identity: string;
    communication_style: string;
    principles: string;
  };
  critical_actions?: string[];
  menu: AgentMenuItem[];
}

interface RawAgentYaml {
  agent?: {
    metadata?: Partial<AgentMetadata>;
    persona?: Partial<AgentDefinition['persona']>;
    critical_actions?: string[];
    menu?: AgentMenuItem[];
  };
}

export function parseAgentYaml(content: string): AgentDefinition | null {
  try {
    const raw = yaml.load(content) as RawAgentYaml;
    if (!raw?.agent?.metadata) return null;

    const agent = raw.agent;
    return {
      metadata: {
        id: agent.metadata?.id || '',
        name: agent.metadata?.name || '',
        title: agent.metadata?.title || '',
        icon: agent.metadata?.icon || '',
        module: agent.metadata?.module || '',
        hasSidecar: agent.metadata?.hasSidecar || false,
      },
      persona: {
        role: agent.persona?.role || '',
        identity: agent.persona?.identity || '',
        communication_style: agent.persona?.communication_style || '',
        principles: agent.persona?.principles || '',
      },
      critical_actions: agent.critical_actions || [],
      menu: agent.menu || [],
    };
  } catch {
    return null;
  }
}

export function parseYamlFile<T = unknown>(content: string): T | null {
  try {
    return yaml.load(content) as T;
  } catch {
    return null;
  }
}
