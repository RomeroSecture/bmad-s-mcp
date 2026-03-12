import { basename } from 'node:path';
import type { ProjectReader } from './project-reader.js';

export type VrgMode = 'VERIFY' | 'REFINE' | 'GENERATE';

export interface ArtifactInventory {
  planning: {
    prd: { exists: boolean; path?: string };
    architecture: { exists: boolean; path?: string };
    ux_design: { exists: boolean; path?: string };
    product_brief: { exists: boolean; path?: string };
    epics: { exists: boolean; count: number; path?: string };
  };
  implementation: {
    sprint_status: { exists: boolean; path?: string };
    stories: { count: number; path?: string };
  };
  project_docs: string[];
  coverage_estimate: number;
  recommended_mode: VrgMode;
  mode_reasoning: string;
}

function emptyInventory(): ArtifactInventory {
  return {
    planning: {
      prd: { exists: false },
      architecture: { exists: false },
      ux_design: { exists: false },
      product_brief: { exists: false },
      epics: { exists: false, count: 0 },
    },
    implementation: {
      sprint_status: { exists: false },
      stories: { count: 0 },
    },
    project_docs: [],
    coverage_estimate: 0,
    recommended_mode: 'GENERATE',
    mode_reasoning: '',
  };
}

function classifyPlanningFile(filePath: string, inventory: ArtifactInventory): void {
  const name = basename(filePath).toLowerCase();
  if (name.includes('prd')) {
    inventory.planning.prd = { exists: true, path: filePath };
  } else if (name.includes('architecture') || name.includes('arch')) {
    inventory.planning.architecture = { exists: true, path: filePath };
  } else if (name.includes('ux') || name.includes('design')) {
    inventory.planning.ux_design = { exists: true, path: filePath };
  } else if (name.includes('brief') || name.includes('product-brief')) {
    inventory.planning.product_brief = { exists: true, path: filePath };
  } else if (name.includes('epic')) {
    inventory.planning.epics.exists = true;
    inventory.planning.epics.count++;
    if (!inventory.planning.epics.path) {
      const slashIdx = filePath.lastIndexOf('/');
      inventory.planning.epics.path = slashIdx > 0 ? filePath.substring(0, slashIdx) : filePath;
    }
  }
}

function classifyImplementationFile(filePath: string, inventory: ArtifactInventory): void {
  const name = basename(filePath).toLowerCase();
  if (name.includes('sprint-status') || name.includes('sprint_status')) {
    inventory.implementation.sprint_status = { exists: true, path: filePath };
  } else if (name.includes('story') || name.match(/^s\d+/)) {
    inventory.implementation.stories.count++;
    if (!inventory.implementation.stories.path) {
      const slashIdx = filePath.lastIndexOf('/');
      inventory.implementation.stories.path = slashIdx > 0 ? filePath.substring(0, slashIdx) : filePath;
    }
  }
}

function calculateCoverage(inventory: ArtifactInventory): number {
  const checks = [
    inventory.planning.prd.exists,
    inventory.planning.architecture.exists,
    inventory.planning.epics.exists,
    inventory.planning.product_brief.exists,
    inventory.implementation.sprint_status.exists,
    inventory.implementation.stories.count > 0,
  ];
  const found = checks.filter(Boolean).length;
  return Math.round((found / checks.length) * 100);
}

export function recommendMode(coverage: number): { mode: VrgMode; reasoning: string } {
  if (coverage >= 90) {
    return {
      mode: 'VERIFY',
      reasoning: `Coverage ${coverage}% (≥90%) — artifacts are substantially complete. Verify existing work, do not overwrite.`,
    };
  }
  if (coverage >= 30) {
    return {
      mode: 'REFINE',
      reasoning: `Coverage ${coverage}% (30-90%) — partial artifacts exist. Refine and improve existing work.`,
    };
  }
  return {
    mode: 'GENERATE',
    reasoning: `Coverage ${coverage}% (<30%) — few or no artifacts found. Generate from scratch.`,
  };
}

/**
 * Scan artifact inventory from a list of file paths.
 * Works without filesystem — just needs the file paths that exist.
 */
export function scanFromFileLists(opts: {
  planningFiles?: string[];
  implementationFiles?: string[];
  projectDocs?: string[];
  scope?: 'planning' | 'implementation' | 'all';
  projectRoot?: string;
}): ArtifactInventory {
  const effectiveScope = opts.scope || 'all';
  const inventory = emptyInventory();

  if ((effectiveScope === 'all' || effectiveScope === 'planning') && opts.planningFiles) {
    for (const file of opts.planningFiles) {
      classifyPlanningFile(file, inventory);
    }
  }
  if ((effectiveScope === 'all' || effectiveScope === 'implementation') && opts.implementationFiles) {
    for (const file of opts.implementationFiles) {
      classifyImplementationFile(file, inventory);
    }
  }

  if (opts.projectDocs) {
    inventory.project_docs = opts.projectRoot
      ? opts.projectDocs.map((d) => d.replace(opts.projectRoot + '/', ''))
      : opts.projectDocs;
  }

  inventory.coverage_estimate = calculateCoverage(inventory);
  const { mode, reasoning } = recommendMode(inventory.coverage_estimate);
  inventory.recommended_mode = mode;
  inventory.mode_reasoning = reasoning;

  return inventory;
}

/**
 * ArtifactScanner with filesystem access.
 * Used when ProjectReader is available.
 */
export class ArtifactScanner {
  constructor(private reader: ProjectReader) {}

  scan(scope?: 'planning' | 'implementation' | 'all'): ArtifactInventory {
    const planningFiles = this.reader.listFiles(this.reader.getPlanningDir());
    const implFiles = this.reader.listFiles(this.reader.getImplDir());
    const docFiles = this.reader.listFiles(this.reader.getDocsDir(), /\.(md|yaml|yml)$/);

    return scanFromFileLists({
      planningFiles,
      implementationFiles: implFiles,
      projectDocs: docFiles,
      scope,
      projectRoot: this.reader.projectRoot,
    });
  }
}
