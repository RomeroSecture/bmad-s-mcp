import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetAgentInputSchema = z.object({
  agent_id: z.string().describe('Agent file path or name (e.g., "analyst", "bmm/agents/analyst.agent.yaml")'),
});

export type GetAgentInput = z.infer<typeof GetAgentInputSchema>;

export function getAgent(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetAgentInput,
): string | null {
  // Try direct path first
  let entry = registry.findByPath(input.agent_id);

  // Try fuzzy match on agent name
  if (!entry) {
    const agents = registry.getByType('agent');
    const search = input.agent_id.toLowerCase().replace(/\.agent\.yaml$/, '');
    entry = agents.find((a) => {
      const fileName = a.relativePath.split('/').pop()?.replace('.agent.yaml', '') || '';
      return fileName.toLowerCase() === search;
    });
  }

  if (!entry) return null;
  return reader.readAbsolute(entry.absolutePath, entry.relativePath);
}
