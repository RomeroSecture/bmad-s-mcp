import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import type { BmadConfig } from '../config/schema.js';

export class ProjectReader {
  readonly projectRoot: string;

  constructor(private config: BmadConfig, projectRoot?: string) {
    this.projectRoot = projectRoot || process.env.BMAD_PROJECT_ROOT || process.cwd();
  }

  isAvailable(): boolean {
    // A project is available if it has _bmad/ (local install) OR _bmad-output/ (MCP-only projects)
    return (
      existsSync(resolve(this.projectRoot, '_bmad')) ||
      existsSync(this.getOutputDir())
    );
  }

  getOutputDir(): string {
    return this.resolvePath(this.config.output_folder);
  }

  getPlanningDir(): string {
    return this.resolvePath(this.config.planning_artifacts);
  }

  getImplDir(): string {
    return this.resolvePath(this.config.implementation_artifacts);
  }

  getDocsDir(): string {
    return this.resolvePath(this.config.project_knowledge);
  }

  getConfigDir(): string {
    return resolve(this.projectRoot, '_bmad', '_config');
  }

  readFile(absolutePath: string): string | null {
    try {
      if (!existsSync(absolutePath)) return null;
      return readFileSync(absolutePath, 'utf-8');
    } catch {
      return null;
    }
  }

  listFiles(dir: string, pattern?: RegExp): string[] {
    if (!existsSync(dir)) return [];
    try {
      const results: string[] = [];
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...this.listFiles(fullPath, pattern));
        } else if (entry.isFile()) {
          if (!pattern || pattern.test(entry.name)) {
            results.push(fullPath);
          }
        }
      }
      return results;
    } catch {
      return [];
    }
  }

  fileExists(path: string): boolean {
    return existsSync(path);
  }

  resolvePath(configPath: string): string {
    return resolve(configPath.replace(/\{project-root\}/g, this.projectRoot));
  }
}
