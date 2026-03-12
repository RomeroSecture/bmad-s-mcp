import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { ExecutionLog, parseLogContent, findOrphans, buildEntry, serializeLog } from '../project/execution-log.js';

export const RecoverExecutionInputSchema = z.object({
  id: z
    .string()
    .optional()
    .describe('Specific execution ID to recover. If omitted, auto-detects all orphan executions.'),
  action: z
    .enum(['diagnose', 'resolve'])
    .default('diagnose')
    .describe('diagnose = show orphans/failures with details, resolve = close an orphan with given status'),
  status: z
    .enum(['SUCCESS', 'PARTIAL', 'FAILED', 'HALTED'])
    .optional()
    .describe('Status to apply when action is "resolve" (required for resolve)'),
  recovery: z.string().optional().describe('Recovery notes explaining the resolution'),
  next_recommended: z.string().optional().describe('Recommended next workflow after recovery'),
  execution_log_content: z
    .string()
    .optional()
    .describe('Raw YAML content of execution-log.yaml. Required in HTTP mode.'),
});

export type RecoverExecutionInput = z.infer<typeof RecoverExecutionInputSchema>;

export function recoverExecution(projectReader: ProjectReader | null, input: RecoverExecutionInput): string {
  // Get entries from either source
  let entries;
  const hasFilesystem = projectReader?.isAvailable() && input.execution_log_content === undefined;

  if (input.execution_log_content !== undefined) {
    entries = parseLogContent(input.execution_log_content || '');
  } else if (projectReader?.isAvailable()) {
    const log = new ExecutionLog(projectReader);
    entries = log.read();
  } else {
    return JSON.stringify({
      error: 'No execution log data available. Pass execution_log_content with the raw YAML content of _bmad-output/execution-log.yaml',
      target_file: '_bmad-output/execution-log.yaml',
    });
  }

  if (input.action === 'diagnose') {
    const orphans = findOrphans(entries);
    const failures = entries.filter((e) => e.status === 'FAILED' || e.status === 'HALTED');

    return JSON.stringify({
      orphan_executions: orphans.map((o) => ({
        id: o.id,
        agent: o.agent,
        trigger: o.trigger,
        workflow: o.workflow,
        started_at: o.started_at,
        suggestion: `Call bmad_recover_execution with id="${o.id}", action="resolve", and appropriate status to close this execution.`,
      })),
      failed_executions: failures.map((f) => ({
        id: f.id,
        agent: f.agent,
        trigger: f.trigger,
        status: f.status,
        errors: f.errors,
        recovery: f.recovery,
      })),
      summary: {
        orphan_count: orphans.length,
        failure_count: failures.length,
        needs_attention: orphans.length > 0 || failures.length > 0,
      },
    }, null, 2);
  }

  // action === 'resolve'
  if (!input.id) return JSON.stringify({ error: 'id is required for resolve action' });
  if (!input.status) return JSON.stringify({ error: 'status is required for resolve action' });

  const orphans = findOrphans(entries);
  const original = orphans.find((o) => o.id === input.id);

  if (!original) {
    const exists = entries.find((e) => e.id === input.id);
    if (!exists) return JSON.stringify({ error: `Execution not found: ${input.id}` });
    return JSON.stringify({ error: `Execution ${input.id} is not an orphan — it already has a closing entry` });
  }

  const closingEntry = buildEntry({
    id: input.id,
    agent: original.agent,
    trigger: original.trigger,
    workflow: original.workflow,
    mode: original.mode,
    status: input.status,
    recovery: input.recovery || 'Resolved via bmad_recover_execution',
    next_recommended: input.next_recommended,
  }, entries);

  // Filesystem mode: write directly
  if (hasFilesystem) {
    const log = new ExecutionLog(projectReader!);
    log.appendEntry(closingEntry);
    return JSON.stringify({
      message: `Execution ${input.id} resolved as ${input.status}`,
      id: closingEntry.id,
      started_at: closingEntry.started_at,
    }, null, 2);
  }

  // Content-passthrough mode: return updated YAML
  entries.push(closingEntry);
  return JSON.stringify({
    message: `Execution ${input.id} resolved as ${input.status}`,
    id: closingEntry.id,
    started_at: closingEntry.started_at,
    target_file: '_bmad-output/execution-log.yaml',
    updated_content: serializeLog(entries),
    action: 'write_file',
    instruction: 'Write the updated_content to the target_file in your project root.',
  }, null, 2);
}
