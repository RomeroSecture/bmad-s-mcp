import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { parseModuleHelp, type WorkflowEntry } from '../utils/csv-parser.js';

export const ListWorkflowsInputSchema = z.object({
  module: z.string().optional().describe('Filter by module (e.g., "bmm", "core")'),
  phase: z.string().optional().describe('Filter by phase (e.g., "1-analysis", "2-planning", "anytime")'),
});

export type ListWorkflowsInput = z.infer<typeof ListWorkflowsInputSchema>;

export function listWorkflows(
  registry: ContentRegistry,
  reader: ContentReader,
  input: ListWorkflowsInput,
): WorkflowEntry[] {
  const csvFiles = registry.getByType('data').filter((e) =>
    e.relativePath.endsWith('module-help.csv')
  );

  // Also check for module-help.csv at module root level
  const rootCsvEntries = registry.getAll().filter((e) =>
    e.relativePath.endsWith('module-help.csv')
  );
  const allCsvEntries = [...new Map([...csvFiles, ...rootCsvEntries].map(e => [e.relativePath, e])).values()];

  let allWorkflows: WorkflowEntry[] = [];

  for (const csvEntry of allCsvEntries) {
    const content = reader.readRaw(csvEntry.absolutePath);
    if (!content) continue;

    const entries = parseModuleHelp(content);
    allWorkflows.push(...entries);
  }

  // Apply filters
  if (input.module) {
    allWorkflows = allWorkflows.filter((w) =>
      w.module.toLowerCase() === input.module!.toLowerCase()
    );
  }

  if (input.phase) {
    allWorkflows = allWorkflows.filter((w) =>
      w.phase.toLowerCase().includes(input.phase!.toLowerCase())
    );
  }

  return allWorkflows;
}
