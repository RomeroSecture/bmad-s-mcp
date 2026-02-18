import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';

export const ListDataInputSchema = z.object({
  category: z.enum(['data', 'protocols', 'all']).optional().default('all'),
});

export type ListDataInput = z.infer<typeof ListDataInputSchema>;

export interface DataSummary {
  path: string;
  module: string;
  name: string;
  format: string;
  category: string;
}

export function listData(
  registry: ContentRegistry,
  input: ListDataInput,
): DataSummary[] {
  const types =
    input.category === 'all'
      ? ['data', 'protocol'] as const
      : input.category === 'protocols'
        ? ['protocol'] as const
        : ['data'] as const;

  const typeSet = new Set<string>(types);
  const entries = registry.getAll().filter((e) => typeSet.has(e.type));

  return entries.map((e) => ({
    path: e.relativePath,
    module: e.module,
    name: e.relativePath.split('/').pop() || e.relativePath,
    format: e.format,
    category: e.type,
  }));
}
