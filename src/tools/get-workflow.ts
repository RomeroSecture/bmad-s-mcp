import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { parseModuleHelp } from '../utils/csv-parser.js';

export const GetWorkflowInputSchema = z.object({
  workflow_code: z.string().optional().describe('Workflow code from module-help.csv (e.g., "CP", "CA", "SP")'),
  workflow_path: z.string().optional().describe('Direct path to the workflow file'),
});

export type GetWorkflowInput = z.infer<typeof GetWorkflowInputSchema>;

export function getWorkflow(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetWorkflowInput,
): { content: string; path: string; engine?: string } | null {
  let workflowPath: string | undefined;

  if (input.workflow_path) {
    workflowPath = input.workflow_path;
  } else if (input.workflow_code) {
    // Look up in module-help.csv files
    const csvFiles = registry.getAll().filter((e) =>
      e.relativePath.endsWith('module-help.csv')
    );

    for (const csvEntry of csvFiles) {
      const csvContent = reader.readRaw(csvEntry.absolutePath);
      if (!csvContent) continue;

      const entries = parseModuleHelp(csvContent);
      const match = entries.find((e) =>
        e.code.toUpperCase() === input.workflow_code!.toUpperCase()
      );

      if (match?.workflow_file) {
        workflowPath = match.workflow_file;
        break;
      }
    }
  }

  if (!workflowPath) return null;

  const entry = registry.findByPath(workflowPath);
  if (!entry) return null;

  const content = reader.readAbsolute(entry.absolutePath, entry.relativePath);
  if (!content) return null;

  // If the workflow is YAML, include a hint about workflow.xml engine
  const isYaml = entry.format === 'yaml';
  const result: { content: string; path: string; engine?: string } = {
    content,
    path: entry.relativePath,
  };

  if (isYaml) {
    result.engine = 'This is a YAML workflow. Use bmad_get_task with task_name="workflow" to get the workflow execution engine (workflow.xml).';
  }

  return result;
}
