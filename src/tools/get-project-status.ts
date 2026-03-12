import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { ExecutionLog, type LogEntry, parseLogContent, findOrphans } from '../project/execution-log.js';
import { ArtifactScanner, scanFromFileLists } from '../project/artifact-scanner.js';
import { SprintReader, type StoryEntry } from '../project/sprint-reader.js';

export const GetProjectStatusInputSchema = z.object({
  include: z
    .array(z.enum(['artifacts', 'executions', 'sprint', 'orphans', 'inconsistencies']))
    .optional()
    .describe('Sections to include (default: all)'),
  execution_log_content: z
    .string()
    .optional()
    .describe('Raw YAML content of execution-log.yaml. Pass in HTTP mode.'),
  planning_files: z
    .array(z.string())
    .optional()
    .describe('List of file paths in planning-artifacts/. Pass in HTTP mode.'),
  implementation_files: z
    .array(z.string())
    .optional()
    .describe('List of file paths in implementation-artifacts/. Pass in HTTP mode.'),
  sprint_status_content: z
    .string()
    .optional()
    .describe('Raw content of sprint-status.yaml. Pass in HTTP mode.'),
  stories_data: z
    .array(z.object({
      id: z.string(),
      filename: z.string(),
      status: z.string().optional(),
      epic: z.string().optional(),
    }))
    .optional()
    .describe('Story metadata array. Pass in HTTP mode.'),
});

export type GetProjectStatusInput = z.infer<typeof GetProjectStatusInputSchema>;

interface Inconsistency {
  type: string;
  description: string;
  details: Record<string, unknown>;
}

function detectInconsistencies(
  entries: LogEntry[],
  stories: StoryEntry[],
): Inconsistency[] {
  const issues: Inconsistency[] = [];

  // 1. Stories marked done without a QA execution entry
  const doneStories = stories.filter((s) =>
    s.status?.toLowerCase() === 'done' || s.status?.toLowerCase() === 'completed',
  );
  const qaEntries = entries.filter((e) => e.trigger === 'QA' && e.status === 'SUCCESS');
  for (const story of doneStories) {
    const hasQa = qaEntries.some(
      (e) => e.artifacts_created?.some((a) => a.toLowerCase().includes(story.id)) ||
        e.artifacts_modified?.some((a) => a.toLowerCase().includes(story.id)),
    );
    if (!hasQa) {
      issues.push({
        type: 'story_without_qa',
        description: `Story ${story.id} is marked as done but has no successful QA execution entry`,
        details: { story_id: story.id, story_status: story.status },
      });
    }
  }

  // 2. DS (Dev Story) entries without corresponding CR (Code Review)
  const dsSuccesses = entries.filter((e) => e.trigger === 'DS' && e.status === 'SUCCESS');
  const crEntries = entries.filter((e) => e.trigger === 'CR');
  for (const ds of dsSuccesses) {
    const hasCr = crEntries.some(
      (e) => e.agent === ds.agent && e.workflow === ds.workflow,
    );
    if (!hasCr) {
      issues.push({
        type: 'dev_without_review',
        description: `Dev Story ${ds.id} completed without a Code Review (CR) entry`,
        details: { execution_id: ds.id, agent: ds.agent },
      });
    }
  }

  // 3. Orphan STARTED entries
  const orphans = findOrphans(entries);
  for (const orphan of orphans) {
    issues.push({
      type: 'orphan_execution',
      description: `Execution ${orphan.id} was started but never closed`,
      details: { execution_id: orphan.id, agent: orphan.agent, trigger: orphan.trigger },
    });
  }

  return issues;
}

export function getProjectStatus(projectReader: ProjectReader | null, input: GetProjectStatusInput): string {
  const sections = input.include || ['artifacts', 'executions', 'sprint', 'orphans', 'inconsistencies'];
  const result: Record<string, unknown> = {};

  const hasFilesystem = projectReader?.isAvailable();
  const hasPassthrough = input.execution_log_content !== undefined ||
    input.planning_files !== undefined ||
    input.stories_data !== undefined;

  if (!hasFilesystem && !hasPassthrough) {
    return JSON.stringify({
      error: 'No project data available. Pass execution_log_content, planning_files, implementation_files, sprint_status_content, and/or stories_data to provide project state in HTTP mode.',
      expected_files: {
        execution_log: '_bmad-output/execution-log.yaml',
        planning_dir: '_bmad-output/planning-artifacts/',
        implementation_dir: '_bmad-output/implementation-artifacts/',
        sprint_status: '_bmad-output/implementation-artifacts/sprint-status.yaml',
      },
    });
  }

  // Get execution log entries
  let allEntries: LogEntry[] = [];
  if (input.execution_log_content !== undefined) {
    allEntries = parseLogContent(input.execution_log_content);
  } else if (hasFilesystem) {
    const log = new ExecutionLog(projectReader!);
    allEntries = log.read();
  }

  if (sections.includes('artifacts')) {
    if (input.planning_files || input.implementation_files) {
      result.artifacts = scanFromFileLists({
        planningFiles: input.planning_files,
        implementationFiles: input.implementation_files,
        scope: 'all',
      });
    } else if (hasFilesystem) {
      const scanner = new ArtifactScanner(projectReader!);
      result.artifacts = scanner.scan('all');
    }
  }

  if (sections.includes('executions')) {
    result.recent_executions = allEntries.slice(-10);
  }

  if (sections.includes('orphans')) {
    result.orphan_executions = findOrphans(allEntries);
  }

  let stories: StoryEntry[] = [];
  if (sections.includes('sprint') || sections.includes('inconsistencies')) {
    if (input.stories_data) {
      stories = input.stories_data.map((s) => ({
        id: s.id,
        filename: s.filename,
        path: s.filename,
        status: s.status,
        epic: s.epic,
      }));
    } else if (hasFilesystem) {
      const sprint = new SprintReader(projectReader!);
      stories = sprint.listStories();
    }

    if (sections.includes('sprint')) {
      let hasStatus = false;
      if (input.sprint_status_content !== undefined) {
        hasStatus = input.sprint_status_content.length > 0;
      } else if (hasFilesystem) {
        const sprint = new SprintReader(projectReader!);
        hasStatus = sprint.getSprintStatus() !== null;
      }

      result.sprint = {
        has_status: hasStatus,
        story_count: stories.length,
        stories: stories.map((s) => ({ id: s.id, status: s.status, epic: s.epic })),
      };
    }
  }

  if (sections.includes('inconsistencies')) {
    result.inconsistencies = detectInconsistencies(allEntries, stories);
  }

  return JSON.stringify(result, null, 2);
}
