import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const SearchContentInputSchema = z.object({
  query: z.string().describe('Search query (keyword or phrase)'),
  file_types: z
    .array(z.string())
    .optional()
    .describe('Filter by file extensions (e.g., ["md", "yaml", "csv"])'),
});

export type SearchContentInput = z.infer<typeof SearchContentInputSchema>;

export interface SearchResult {
  path: string;
  module: string;
  type: string;
  matches: string[];
}

export function searchContent(
  registry: ContentRegistry,
  reader: ContentReader,
  input: SearchContentInput,
): SearchResult[] {
  const query = input.query.toLowerCase();
  let entries = registry.getAll();

  if (input.file_types?.length) {
    entries = entries.filter((e) =>
      input.file_types!.includes(e.format)
    );
  }

  const results: SearchResult[] = [];

  for (const entry of entries) {
    const content = reader.readAbsolute(entry.absolutePath);
    if (!content) continue;

    const lines = content.split('\n');
    const matchingLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(query)) {
        matchingLines.push(`L${i + 1}: ${lines[i].trim().substring(0, 150)}`);
        if (matchingLines.length >= 5) break; // Cap at 5 matches per file
      }
    }

    if (matchingLines.length > 0) {
      results.push({
        path: entry.relativePath,
        module: entry.module,
        type: entry.type,
        matches: matchingLines,
      });
    }
  }

  return results.slice(0, 20); // Cap total results
}
