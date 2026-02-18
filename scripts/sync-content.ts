#!/usr/bin/env tsx
/**
 * Syncs _bmad/ and _docs/ content into content/ directory, applying MCP tool
 * call transformations so the server can serve MCP-ready content directly.
 *
 * Sources:
 *   ./_bmad/{core,bmm,utility}  → content/{core,bmm,utility}  (workflows, agents, steps)
 *   ./_docs/                    → content/docs/                (methodology documentation)
 *
 * Usage:
 *   npm run sync-content              # sync from local _bmad/ and _docs/
 *   npm run sync-content -- --from /path/to/external/_bmad  # sync _bmad from external source
 */
import {
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformContent } from '../src/utils/content-transformer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Parse --from flag for external source
const fromIdx = process.argv.indexOf('--from');
const bmadSource = fromIdx !== -1 && process.argv[fromIdx + 1]
  ? resolve(process.argv[fromIdx + 1])
  : resolve(projectRoot, '_bmad');

const contentDest = resolve(projectRoot, 'content');
const MODULES = ['core', 'bmm', 'utility'];

// File extensions that contain transformable text content
const TRANSFORMABLE_EXTS = new Set(['.md', '.yaml', '.yml', '.xml', '.txt']);

if (!existsSync(bmadSource)) {
  console.error(`Source not found: ${bmadSource}`);
  console.error(`Expected _bmad/ directory at: ${bmadSource}`);
  console.error('');
  console.error('If syncing from the parent BMAD-S repo, use:');
  console.error('  npm run sync-content -- --from ../path/to/_bmad');
  process.exit(1);
}

// Clean destination
if (existsSync(contentDest)) {
  rmSync(contentDest, { recursive: true });
}
mkdirSync(contentDest, { recursive: true });

let totalFiles = 0;
let transformedFiles = 0;

function walkAndCopy(srcDir: string, destDir: string, module: string): void {
  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    // Skip _module-installer directories
    if (entry.name === '_module-installer') continue;

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      walkAndCopy(srcPath, destPath, module);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      const relativePath = relative(contentDest, destPath);

      if (TRANSFORMABLE_EXTS.has(ext)) {
        // Read, transform, write
        const raw = readFileSync(srcPath, 'utf-8');
        const transformed = transformContent(raw, relativePath);
        writeFileSync(destPath, transformed, 'utf-8');
        if (transformed !== raw) {
          transformedFiles++;
        }
      } else {
        // Binary or non-transformable: copy as-is
        const content = readFileSync(srcPath);
        writeFileSync(destPath, content);
      }
      totalFiles++;
    }
  }
}

for (const mod of MODULES) {
  const src = join(bmadSource, mod);
  const dest = join(contentDest, mod);

  if (!existsSync(src)) {
    console.warn(`Module not found, skipping: ${mod}`);
    continue;
  }

  mkdirSync(dest, { recursive: true });
  walkAndCopy(src, dest, mod);
  console.log(`Synced: ${mod}`);
}

// Sync _docs/ → content/docs/
const docsSource = resolve(projectRoot, '_docs');
const docsDest = join(contentDest, 'docs');

if (existsSync(docsSource)) {
  mkdirSync(docsDest, { recursive: true });
  walkAndCopy(docsSource, docsDest, 'docs');
  console.log(`Synced: docs`);
} else {
  console.warn(`_docs/ not found, skipping documentation sync`);
}

console.log('');
console.log(`Content sync complete.`);
console.log(`  Total files: ${totalFiles}`);
console.log(`  Transformed: ${transformedFiles} (MCP tool call rewrites)`);
console.log(`  Source _bmad: ${bmadSource}`);
console.log(`  Source _docs: ${docsSource}`);
console.log(`  Dest:         ${contentDest}`);
