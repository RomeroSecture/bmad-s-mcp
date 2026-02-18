import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetTaskInputSchema = z.object({
  task_name: z.string().describe('Task name (e.g., "workflow", "help", "shard-doc", "index-docs")'),
});

export type GetTaskInput = z.infer<typeof GetTaskInputSchema>;

export function getTask(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetTaskInput,
): string | null {
  const tasks = registry.getByType('task');
  const name = input.task_name.toLowerCase();

  // Try exact match by filename (without extension)
  let match = tasks.find((t) => {
    const fileName = t.relativePath.split('/').pop()?.replace(/\.(xml|md|yaml)$/, '') || '';
    return fileName.toLowerCase() === name;
  });

  // Try fuzzy match
  if (!match) {
    match = tasks.find((t) => t.relativePath.toLowerCase().includes(name));
  }

  if (!match) return null;
  return reader.readAbsolute(match.absolutePath);
}
