import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ContentRegistry } from './registry.js';

export class ContentReader {
  constructor(private registry: ContentRegistry) {}

  /**
   * Reads a file by its relative path within the content directory.
   */
  readByPath(relativePath: string): string | null {
    const entry = this.registry.findByPath(relativePath);
    if (!entry) return null;
    return this.readAbsolute(entry.absolutePath);
  }

  /**
   * Reads a file by its absolute path.
   */
  readAbsolute(absolutePath: string): string | null {
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
