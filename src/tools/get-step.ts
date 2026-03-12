import { z } from 'zod';
import { resolve, dirname } from 'node:path';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetStepInputSchema = z.object({
  workflow_path: z.string().describe('Path to the workflow directory or workflow file'),
  step_file: z.string().describe('Step filename (e.g., "step-01.md", "step-02.md")'),
  steps_dir: z.string().optional().describe('Steps subdirectory name (e.g., "steps-c", "steps-v", "steps-e"). Required for most workflows — check the nextStepFile YAML comment for the correct value.'),
});

export type GetStepInput = z.infer<typeof GetStepInputSchema>;

export function getStep(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetStepInput,
): string | null {
  // Normalize workflow path - if it points to a workflow file, get its directory
  let workflowDir = input.workflow_path;
  const lastSegment = workflowDir.split('/').pop() || '';
  if (lastSegment.startsWith('workflow.') || lastSegment.startsWith('workflow-')) {
    workflowDir = dirname(workflowDir);
  }

  // Clean path prefix
  workflowDir = workflowDir.replace(/^_bmad\//, '');

  // Build the step path (fallback to 'steps' if not provided)
  const stepsDir = input.steps_dir ?? 'steps';
  const stepPath = `${workflowDir}/${stepsDir}/${input.step_file}`;
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
