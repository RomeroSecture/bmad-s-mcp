#!/usr/bin/env tsx
/**
 * Syncs _bmad/ content from BMAD-S repo into content/ directory.
 * Copies core/, bmm/, utility/ — excludes _module-installer/.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const bmadSource = resolve(projectRoot, '..', '_bmad');
const contentDest = resolve(projectRoot, 'content');

const MODULES = ['core', 'bmm', 'utility'];

if (!existsSync(bmadSource)) {
  console.error(`Source not found: ${bmadSource}`);
  process.exit(1);
}

// Clean destination
if (existsSync(contentDest)) {
  rmSync(contentDest, { recursive: true });
}
mkdirSync(contentDest, { recursive: true });

for (const mod of MODULES) {
  const src = join(bmadSource, mod);
  const dest = join(contentDest, mod);

  if (!existsSync(src)) {
    console.warn(`Module not found, skipping: ${mod}`);
    continue;
  }

  cpSync(src, dest, {
    recursive: true,
    filter: (source) => !source.includes('_module-installer'),
  });
  console.log(`Synced: ${mod}`);
}

console.log('Content sync complete.');
