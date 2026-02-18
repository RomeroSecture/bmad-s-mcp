import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetDataInputSchema = z.object({
  data_path: z.string().describe('Path to the data file (CSV, JSON, etc.) relative to content root'),
});

export type GetDataInput = z.infer<typeof GetDataInputSchema>;

export function getData(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetDataInput,
): string | null {
  const entry = registry.findByPath(input.data_path);
  if (!entry) return null;
  return reader.readAbsolute(entry.absolutePath, entry.relativePath);
}
