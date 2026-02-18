import { z } from 'zod';
import type { ContentRegistry, ContentModule } from '../content/registry.js';

export const ListTemplatesInputSchema = z.object({
  module: z.enum(['core', 'bmm', 'utility', 'all']).optional().default('all'),
});

export type ListTemplatesInput = z.infer<typeof ListTemplatesInputSchema>;

export interface TemplateSummary {
  path: string;
  module: string;
  name: string;
}

export function listTemplates(
  registry: ContentRegistry,
  input: ListTemplatesInput,
): TemplateSummary[] {
  const mod = input.module === 'all' ? undefined : input.module as ContentModule;
  const templates = mod
    ? registry.getByTypeAndModule('template', mod)
    : registry.getByType('template');

  return templates.map((t) => ({
    path: t.relativePath,
    module: t.module,
    name: t.relativePath.split('/').pop() || t.relativePath,
  }));
}
