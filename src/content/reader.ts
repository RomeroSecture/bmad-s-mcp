import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ContentRegistry } from './registry.js';
import { transformContent } from '../utils/content-transformer.js';

export class ContentReader {
  constructor(private registry: ContentRegistry) {}

  /**
   * Reads a file by its relative path and transforms file references
   * into MCP tool calls automatically.
   */
  readByPath(relativePath: string): string | null {
    const entry = this.registry.findByPath(relativePath);
    if (!entry) return null;
    const raw = this.readRaw(entry.absolutePath);
    if (!raw) return null;
    return transformContent(raw, entry.relativePath);
  }

  /**
   * Reads a file by its absolute path. If relativePath is provided,
   * transforms file references into MCP tool calls.
   * Without relativePath, returns raw content (used by CSV parsers, etc.).
   */
  readAbsolute(absolutePath: string, relativePath?: string): string | null {
    const raw = this.readRaw(absolutePath);
    if (!raw) return null;
    if (relativePath) {
      return transformContent(raw, relativePath);
    }
    return raw;
  }

  /**
   * Reads a file without any transformation (raw content).
   */
  readRaw(absolutePath: string): string | null {
    try {
      if (!existsSync(absolutePath)) return null;
      return readFileSync(absolutePath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Reads a file from the content root by joining path segments.
   */
  readFromContent(...segments: string[]): string | null {
    const fullPath = resolve(this.registry.getContentRoot(), ...segments);
    return this.readAbsolute(fullPath);
  }

  /**
   * Checks if a file exists in the content.
   */
  exists(relativePath: string): boolean {
    return this.registry.findByPath(relativePath) !== undefined;
  }
}
