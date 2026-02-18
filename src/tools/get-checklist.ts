import { z } from 'zod';
import { dirname } from 'node:path';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import yaml from 'js-yaml';

export const GetChecklistInputSchema = z.object({
  workflow_path: z.string().describe('Path to the workflow file or directory'),
});

export type GetChecklistInput = z.infer<typeof GetChecklistInputSchema>;

interface WorkflowYaml {
  validation?: string;
  checklist?: string;
}

export function getChecklist(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetChecklistInput,
): string | null {
  let workflowDir = input.workflow_path.replace(/^_bmad\//, '');

  // If path points to a file, get its directory
  if (workflowDir.includes('workflow.') || workflowDir.includes('workflow-')) {
    // Try reading the workflow file to find validation reference
    const entry = registry.findByPath(workflowDir);
    if (entry) {
      const content = reader.readAbsolute(entry.absolutePath);
      if (content && entry.format === 'yaml') {
        try {
          const wfYaml = yaml.load(content) as WorkflowYaml;
          if (wfYaml?.validation) {
            const validationEntry = registry.findByPath(wfYaml.validation);
            if (validationEntry) {
              return reader.readAbsolute(validationEntry.absolutePath);
            }
          }
        } catch {
          // Not a YAML workflow, continue
        }
      }
    }
    workflowDir = dirname(workflowDir);
  }

  // Look for checklist/validation files in the workflow directory
  const checklistPatterns = ['checklist', 'validation', 'validate'];
  const allEntries = registry.getAll().filter((e) =>
    e.relativePath.startsWith(workflowDir)
  );

  for (const pattern of checklistPatterns) {
    const match = allEntries.find((e) =>
      e.relativePath.toLowerCase().includes(pattern)
    );
    if (match) {
      return reader.readAbsolute(match.absolutePath);
    }
  }

  return null;
}
