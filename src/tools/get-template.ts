import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetTemplateInputSchema = z.object({
  template_path: z.string().describe('Path to the template file relative to content root'),
});

export type GetTemplateInput = z.infer<typeof GetTemplateInputSchema>;

export function getTemplate(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetTemplateInput,
): string | null {
  const entry = registry.findByPath(input.template_path);
  if (!entry) return null;
  return reader.readAbsolute(entry.absolutePath);
}
