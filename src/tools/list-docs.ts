import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';

export const ListDocsInputSchema = z.object({
  category: z
    .enum(['tutorials', 'how-to', 'explanation', 'reference', 'bmgd', 'all'])
    .optional()
    .default('all')
    .describe('Filter docs by category (Diátaxis): tutorials, how-to, explanation, reference, bmgd, or all'),
});

export type ListDocsInput = z.infer<typeof ListDocsInputSchema>;

export interface DocEntry {
  title: string;
  path: string;
  category: string;
}

function inferCategory(relativePath: string): string {
  const parts = relativePath.replace(/^docs\//, '').split('/');
  if (parts.length > 1) return parts[0];
  return 'general';
}

function inferTitle(relativePath: string): string {
  const fileName = relativePath.split('/').pop() || relativePath;
  return fileName
    .replace(/\.(md|txt)$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function listDocs(
  registry: ContentRegistry,
  input: ListDocsInput,
): DocEntry[] {
  let docs = registry.getByType('doc');

  if (input.category && input.category !== 'all') {
    docs = docs.filter((d) => {
      const cat = inferCategory(d.relativePath);
      return cat === input.category;
    });
  }

  return docs
    .filter((d) => {
      const name = d.relativePath.split('/').pop() || '';
      // Exclude internal/binary files
      if (name.startsWith('_') || name === '404.md') return false;
      if (/\.(png|jpg|jpeg|gif|svg|ico)$/i.test(name)) return false;
      return true;
    })
    .map((d) => ({
      title: inferTitle(d.relativePath),
      path: d.relativePath,
      category: inferCategory(d.relativePath),
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
}
