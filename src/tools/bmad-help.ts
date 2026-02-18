import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { parseModuleHelp, type WorkflowEntry } from '../utils/csv-parser.js';
import { loadConfig } from '../config/loader.js';

export const BmadHelpInputSchema = z.object({
  context: z.string().optional().describe('What was just completed or what you need help with'),
  project_root: z.string().optional().describe('Project root path for artifact detection'),
});

export type BmadHelpInput = z.infer<typeof BmadHelpInputSchema>;

export function bmadHelp(
  registry: ContentRegistry,
  reader: ContentReader,
  input: BmadHelpInput,
): string {
  const config = loadConfig(input.project_root);

  // Load all workflows from module-help.csv
  const csvFiles = registry.getAll().filter((e) =>
    e.relativePath.endsWith('module-help.csv')
  );

  const allWorkflows: WorkflowEntry[] = [];
  for (const csvEntry of csvFiles) {
    const content = reader.readAbsolute(csvEntry.absolutePath);
    if (!content) continue;
    allWorkflows.push(...parseModuleHelp(content));
  }

  // Group by phase
  const phases = new Map<string, WorkflowEntry[]>();
  for (const wf of allWorkflows) {
    const phase = wf.phase || 'anytime';
    if (!phases.has(phase)) phases.set(phase, []);
    phases.get(phase)!.push(wf);
  }

  // Sort phases: anytime first, then numbered
  const sortedPhases = Array.from(phases.entries()).sort(([a], [b]) => {
    if (a === 'anytime') return -1;
    if (b === 'anytime') return 1;
    return a.localeCompare(b);
  });

  // Build help response
  const lines: string[] = [];
  lines.push(`# BMAD Method - Available Workflows`);
  lines.push(`\nProject: **${config.project_name}** | Language: ${config.communication_language}`);
  lines.push(`\nUse \`bmad_get_workflow\` with the workflow code to load any workflow.\n`);

  // Load the help.md task for routing rules context
  const helpTask = reader.readFromContent('core', 'tasks', 'help.md');

  for (const [phase, workflows] of sortedPhases) {
    lines.push(`\n## Phase: ${phase}`);

    // Sort by sequence within phase
    const sorted = workflows.sort((a, b) => {
      const seqA = parseInt(a.sequence) || 999;
      const seqB = parseInt(b.sequence) || 999;
      return seqA - seqB;
    });

    for (const wf of sorted) {
      const required = wf.required ? ' **(required)**' : '';
      const agent = wf.agent ? ` | Agent: ${wf.agent}` : '';
      const command = wf.command ? ` | Command: \`/${wf.command}\`` : '';
      lines.push(`- **${wf.name}** [${wf.code}]${required}${agent}${command}`);
      lines.push(`  ${wf.description}`);
    }
  }

  if (input.context) {
    lines.push(`\n---\n## Context-Aware Routing`);
    lines.push(`Based on your context: "${input.context}"`);
    lines.push(`\nRecommendation: Use \`bmad_get_task\` with task_name="help" to get the full routing engine, then analyze your project state.`);
  }

  return lines.join('\n');
}
