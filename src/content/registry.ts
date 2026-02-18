import { readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { getContentRoot } from '../utils/path-resolver.js';

export type ContentType =
  | 'agent'
  | 'workflow'
  | 'step'
  | 'template'
  | 'data'
  | 'task'
  | 'protocol'
  | 'config'
  | 'tool'
  | 'doc'
  | 'other';

export type ContentModule = 'core' | 'bmm' | 'utility' | 'docs';
export type ContentFormat = 'md' | 'yaml' | 'csv' | 'xml' | 'txt' | 'json' | 'js' | 'sh' | 'other';

export interface ContentEntry {
  relativePath: string;
  absolutePath: string;
  type: ContentType;
  module: ContentModule;
  format: ContentFormat;
}

function inferFormat(filePath: string): ContentFormat {
  const ext = extname(filePath).slice(1).toLowerCase();
  const known: ContentFormat[] = ['md', 'yaml', 'csv', 'xml', 'txt', 'json', 'js', 'sh'];
  return (known.includes(ext as ContentFormat) ? ext : 'other') as ContentFormat;
}

function inferType(relativePath: string): ContentType {
  const lower = relativePath.toLowerCase();
  if (lower.startsWith('docs/')) return 'doc';
  if (lower.includes('/agents/') && lower.endsWith('.agent.yaml')) return 'agent';
  if (lower.includes('/workflows/') && lower.includes('/steps/')) return 'step';
  if (lower.includes('/workflows/') && (lower.includes('workflow.') || lower.includes('workflow-'))) return 'workflow';
  if (lower.includes('/templates/')) return 'template';
  if (lower.includes('/data/')) return 'data';
  if (lower.includes('/tasks/')) return 'task';
  if (lower.includes('/protocols/')) return 'protocol';
  if (lower.includes('/tools/')) return 'tool';
  if (lower.endsWith('config.yaml') || lower.endsWith('module.yaml')) return 'config';
  // Steps can also be in steps-v, steps-c, steps-e directories
  if (/\/steps-[a-z]\//.test(lower)) return 'step';
  return 'other';
}

function inferModule(relativePath: string): ContentModule {
  if (relativePath.startsWith('core/')) return 'core';
  if (relativePath.startsWith('bmm/')) return 'bmm';
  if (relativePath.startsWith('utility/')) return 'utility';
  if (relativePath.startsWith('docs/')) return 'docs';
  return 'core';
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

export class ContentRegistry {
  private entries: Map<string, ContentEntry> = new Map();
  private contentRoot: string;

  constructor(contentRoot?: string) {
    this.contentRoot = contentRoot || getContentRoot();
    this.index();
  }

  private index(): void {
    const files = walkDir(this.contentRoot);

    for (const absPath of files) {
      const relPath = relative(this.contentRoot, absPath);
      const entry: ContentEntry = {
        relativePath: relPath,
        absolutePath: absPath,
        type: inferType(relPath),
        module: inferModule(relPath),
        format: inferFormat(relPath),
      };
      this.entries.set(relPath, entry);
    }
  }

  getAll(): ContentEntry[] {
    return Array.from(this.entries.values());
  }

  getByType(type: ContentType): ContentEntry[] {
    return this.getAll().filter((e) => e.type === type);
  }

  getByModule(module: ContentModule): ContentEntry[] {
    return this.getAll().filter((e) => e.module === module);
  }

  getByTypeAndModule(type: ContentType, module?: ContentModule | 'all'): ContentEntry[] {
    let results = this.getByType(type);
    if (module && module !== 'all') {
      results = results.filter((e) => e.module === module);
    }
    return results;
  }

  findByPath(path: string): ContentEntry | undefined {
    // Try exact match first
    const clean = path.replace(/^_bmad\//, '');
    const entry = this.entries.get(clean);
    if (entry) return entry;

    // Try partial match
    for (const [key, value] of this.entries) {
      if (key.endsWith(path) || key.includes(path)) {
        return value;
      }
    }
    return undefined;
  }

  search(query: string): ContentEntry[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(
      (e) =>
        e.relativePath.toLowerCase().includes(lower) ||
        e.type.includes(lower)
    );
  }

  get size(): number {
    return this.entries.size;
  }

  getContentRoot(): string {
    return this.contentRoot;
  }
}
