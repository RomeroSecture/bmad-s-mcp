import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetAgentInputSchema = z.object({
  agent_id: z
    .string()
    .describe('Agent name or file path (e.g., "lisa", "homer", "frink", "bmm/agents/lisa.agent.yaml")'),
});

export type GetAgentInput = z.infer<typeof GetAgentInputSchema>;

// Maps role-based names (used in module-help.csv) to character filenames
const ROLE_TO_CHARACTER: Record<string, string> = {
  pm: 'lisa',
  architect: 'frink',
  dev: 'homer',
  qa: 'edna',
  'ux-designer': 'marge',
  sm: 'ned',
  analyst: 'monty',
  deploy: 'wiggum',
  git: 'milhouse',
  setup: 'smithers',
  'quick-flow-solo-dev': 'bart',
  'tech-writer': 'kent',
};

export function getAgent(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetAgentInput,
): string | null {
  // Step 1: Try direct path first
  let entry = registry.findByPath(input.agent_id);

  // Step 2: Try fuzzy match on filename (e.g., "lisa", "homer", "frink")
  if (!entry) {
    const agents = registry.getByType('agent');
    const search = input.agent_id.toLowerCase().replace(/\.agent\.yaml$/, '');
    entry = agents.find((a) => {
      const fileName = a.relativePath.split('/').pop()?.replace('.agent.yaml', '') || '';
      return fileName.toLowerCase() === search;
    });
  }

  // Step 3: Try role name → character name mapping (e.g., "pm" → "lisa")
  if (!entry) {
    const search = input.agent_id.toLowerCase().replace(/\.agent\.yaml$/, '');
    const characterName = ROLE_TO_CHARACTER[search];
    if (characterName) {
      const agents = registry.getByType('agent');
      entry = agents.find((a) => {
        const fileName = a.relativePath.split('/').pop()?.replace('.agent.yaml', '') || '';
        return fileName.toLowerCase() === characterName;
      });
    }
  }

  if (!entry) return null;
  return reader.readAbsolute(entry.absolutePath, entry.relativePath);
}
