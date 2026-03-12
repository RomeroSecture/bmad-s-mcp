import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { ArtifactScanner, scanFromFileLists } from '../project/artifact-scanner.js';

export const GetArtifactInventoryInputSchema = z.object({
  scope: z
    .enum(['planning', 'implementation', 'all'])
    .optional()
    .describe('Scope of scan: planning, implementation, or all (default)'),
  planning_files: z
    .array(z.string())
    .optional()
    .describe('List of file paths in planning-artifacts/ directory. Pass this in HTTP mode — the LLM should list the directory and pass filenames here.'),
  implementation_files: z
    .array(z.string())
    .optional()
    .describe('List of file paths in implementation-artifacts/ directory. Pass this in HTTP mode.'),
  project_doc_files: z
    .array(z.string())
    .optional()
    .describe('List of file paths in docs/project/ directory. Pass this in HTTP mode.'),
});

export type GetArtifactInventoryInput = z.infer<typeof GetArtifactInventoryInputSchema>;

export function getArtifactInventory(projectReader: ProjectReader | null, input: GetArtifactInventoryInput): string {
  // Content-passthrough mode: file lists provided
  if (input.planning_files || input.implementation_files || input.project_doc_files) {
    const inventory = scanFromFileLists({
      planningFiles: input.planning_files,
      implementationFiles: input.implementation_files,
      projectDocs: input.project_doc_files,
      scope: input.scope,
    });
    return JSON.stringify(inventory, null, 2);
  }

  // Filesystem mode
  if (projectReader?.isAvailable()) {
    const scanner = new ArtifactScanner(projectReader);
    const inventory = scanner.scan(input.scope);
    return JSON.stringify(inventory, null, 2);
  }

  return JSON.stringify({
    error: 'No artifact data available. Pass planning_files, implementation_files, and/or project_doc_files with the file paths found in your project directories.',
    expected_dirs: {
      planning: '_bmad-output/planning-artifacts/',
      implementation: '_bmad-output/implementation-artifacts/',
      project_docs: 'docs/project/',
    },
  });
}
