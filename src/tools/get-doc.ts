import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetDocInputSchema = z.object({
  doc_path: z
    .string()
    .optional()
    .describe('Direct path to the doc file (e.g., "docs/how-to/install-bmad.md")'),
  topic: z
    .string()
    .optional()
    .describe('Topic to search for (e.g., "brainstorming", "party mode", "getting started")'),
});

export type GetDocInput = z.infer<typeof GetDocInputSchema>;

export function getDoc(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetDocInput,
): string | null {
  // Direct path
  if (input.doc_path) {
    const entry = registry.findByPath(input.doc_path);
    if (entry && entry.type === 'doc') {
      return reader.readAbsolute(entry.absolutePath, entry.relativePath);
    }
    return null;
  }

  // Topic search
  if (input.topic) {
    const topic = input.topic.toLowerCase();
    const docs = registry.getByType('doc');

    // Try exact filename match first
    let match = docs.find((d) => {
      const fileName = d.relativePath.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
      return fileName.toLowerCase() === topic || fileName.toLowerCase().replace(/-/g, ' ') === topic;
    });

    // Try partial filename match
    if (!match) {
      match = docs.find((d) => {
        const fileName = d.relativePath.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
        return fileName.toLowerCase().includes(topic.replace(/\s+/g, '-'));
      });
    }

    // Try content match — look for topic in file paths
    if (!match) {
      match = docs.find((d) => d.relativePath.toLowerCase().includes(topic.replace(/\s+/g, '-')));
    }

    if (match) {
      return reader.readAbsolute(match.absolutePath, match.relativePath);
    }
  }

  return null;
}
