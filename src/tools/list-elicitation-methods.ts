import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const ListElicitationMethodsInputSchema = z.object({
  category: z
    .string()
    .optional()
    .describe('Filter by category (e.g., "collaboration", "advanced", "creative", "risk", "core")'),
});

export type ListElicitationMethodsInput = z.infer<typeof ListElicitationMethodsInputSchema>;

interface ElicitationMethod {
  num: number;
  category: string;
  method_name: string;
  description: string;
  output_pattern: string;
}

/** Parse a single CSV line respecting quoted fields */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

export function listElicitationMethods(
  registry: ContentRegistry,
  reader: ContentReader,
  input: ListElicitationMethodsInput,
): ElicitationMethod[] {
  // Find the methods.csv in the content registry
  const entry = registry.findByPath('core/workflows/advanced-elicitation/methods.csv');
  if (!entry) return [];

  const raw = reader.readRaw(entry.absolutePath);
  if (!raw) return [];

  const lines = raw.replace(/\r\n/g, '\n').trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header line
  const methods: ElicitationMethod[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    if (parts.length < 5) continue;

    const method: ElicitationMethod = {
      num: parseInt(parts[0], 10) || 0,
      category: parts[1].trim(),
      method_name: parts[2].trim(),
      description: parts[3].trim(),
      output_pattern: parts[4].trim(),
    };

    if (input.category && method.category.toLowerCase() !== input.category.toLowerCase()) continue;
    methods.push(method);
  }

  return methods;
}
