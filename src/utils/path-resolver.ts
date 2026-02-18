import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Returns the absolute path to the bundled content directory.
 */
export function getContentRoot(): string {
  // In dist: dist/utils/path-resolver.js → need to go up to project root
  // Content is at project_root/content/
  return resolve(__dirname, '..', '..', 'content');
}

/**
 * Translates a _bmad/ relative path to a content/ path.
 * e.g., "_bmad/bmm/agents/analyst.agent.yaml" → "bmm/agents/analyst.agent.yaml"
 */
export function translateBmadPath(bmadPath: string): string {
  return bmadPath.replace(/^_bmad\//, '');
}

/**
 * Resolves a content-relative path to an absolute path.
 * e.g., "bmm/agents/analyst.agent.yaml" → "/abs/path/content/bmm/agents/analyst.agent.yaml"
 */
export function resolveContentPath(relativePath: string): string {
  const contentRoot = getContentRoot();
  // Strip leading _bmad/ if present
  const cleanPath = translateBmadPath(relativePath);
  return resolve(contentRoot, cleanPath);
}
