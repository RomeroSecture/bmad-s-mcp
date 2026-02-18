import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { parseAgentYaml } from '../utils/yaml-parser.js';

export const ListAgentsInputSchema = z.object({
  module: z.enum(['core', 'bmm', 'all']).optional().default('all'),
});

export type ListAgentsInput = z.infer<typeof ListAgentsInputSchema>;

export interface AgentSummary {
  id: string;
  name: string;
  title: string;
  icon: string;
  module: string;
  role: string;
  menu_codes: string[];
}

export function listAgents(
  registry: ContentRegistry,
  reader: ContentReader,
  input: ListAgentsInput,
): AgentSummary[] {
  const agentEntries = registry.getByTypeAndModule('agent', input.module === 'all' ? 'all' : input.module);
  const agents: AgentSummary[] = [];

  for (const entry of agentEntries) {
    const content = reader.readRaw(entry.absolutePath);
    if (!content) continue;

    const parsed = parseAgentYaml(content);
    if (!parsed) continue;

    const menuCodes = parsed.menu
      .map((m) => {
        const match = m.trigger.match(/^([A-Z]+)/);
        return match ? match[1] : null;
      })
      .filter((c): c is string => c !== null);

    agents.push({
      id: entry.relativePath,
      name: parsed.metadata.name,
      title: parsed.metadata.title,
      icon: parsed.metadata.icon,
      module: parsed.metadata.module || entry.module,
      role: parsed.persona.role,
      menu_codes: menuCodes,
    });
  }

  return agents;
}
