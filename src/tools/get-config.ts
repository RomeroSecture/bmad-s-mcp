import { z } from 'zod';
import yaml from 'js-yaml';
import { loadConfig } from '../config/loader.js';
import { resolveConfigValue } from '../config/variables.js';
import type { BmadConfig } from '../config/schema.js';

export const GetConfigInputSchema = z.object({
  project_root: z.string().optional().describe('Project root path (defaults to CWD)'),
});

export type GetConfigInput = z.infer<typeof GetConfigInputSchema>;

export function getConfig(input: GetConfigInput): string {
  const projectRoot = input.project_root || process.cwd();
  const config = loadConfig(projectRoot);

  // Resolve path variables in the config
  const resolved: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      resolved[key] = resolveConfigValue(value, projectRoot);
    } else {
      resolved[key] = value;
    }
  }

  return yaml.dump(resolved, { lineWidth: 120 });
}
