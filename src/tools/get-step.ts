import { z } from 'zod';
import { resolve, dirname } from 'node:path';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetStepInputSchema = z.object({
  workflow_path: z.string().describe('Path to the workflow directory or workflow file'),
  step_file: z.string().describe('Step filename (e.g., "step-01.md", "step-02.md")'),
  steps_dir: z.string().optional().default('steps').describe('Steps subdirectory name (default: "steps")'),
});

export type GetStepInput = z.infer<typeof GetStepInputSchema>;

export function getStep(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetStepInput,
): string | null {
  // Normalize workflow path - if it's a file, get its directory
  let workflowDir = input.workflow_path;
  if (workflowDir.includes('workflow.') || workflowDir.includes('workflow-')) {
    workflowDir = dirname(workflowDir);
  }

  // Clean path prefix
  workflowDir = workflowDir.replace(/^_bmad\//, '');

  // Build the step path
  const stepPath = `${workflowDir}/${input.steps_dir}/${input.step_file}`;
  const entry = registry.findByPath(stepPath);

  if (!entry) {
    // Try without the steps_dir (some workflows have steps directly)
    const altPath = `${workflowDir}/${input.step_file}`;
    const altEntry = registry.findByPath(altPath);
    if (altEntry) {
      return reader.readAbsolute(altEntry.absolutePath, altEntry.relativePath);
    }
    return null;
  }

  return reader.readAbsolute(entry.absolutePath, entry.relativePath);
}
