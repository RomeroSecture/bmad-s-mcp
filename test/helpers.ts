import { resolve } from 'node:path';
import { ContentRegistry } from '../src/content/registry.js';
import { ContentReader } from '../src/content/reader.js';

/** Path to the test fixture content directory */
export const FIXTURE_ROOT = resolve(import.meta.dirname, 'fixtures', 'content');

/** Creates a ContentRegistry pointing to the test fixture content */
export function createTestRegistry(): ContentRegistry {
  return new ContentRegistry(FIXTURE_ROOT);
}

/** Creates a ContentReader backed by the test fixture registry */
export function createTestReader(registry?: ContentRegistry): ContentReader {
  const reg = registry ?? createTestRegistry();
  return new ContentReader(reg);
}
