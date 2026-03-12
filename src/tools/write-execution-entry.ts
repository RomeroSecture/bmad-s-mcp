import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { ExecutionLog, parseLogContent, buildEntry, serializeLog } from '../project/execution-log.js';

export const WriteExecutionEntryInputSchema = z.object({
  phase: z
    .enum(['start', 'close'])
    .describe('Phase: "start" logs a STARTED entry, "close" logs a closing entry'),
  id: z.string().optional().describe('Execution ID (auto-generated for start, required for close)'),
  agent: z.string().describe('Agent name (e.g., "homer", "lisa")'),
  trigger: z.string().describe('Workflow trigger code (e.g., "DS", "CP")'),
  workflow: z.string().describe('Workflow path'),
  mode: z
    .enum(['GENERATE', 'REFINE', 'VERIFY'])
    .optional()
    .describe('VRG execution mode'),
  status: z
    .enum(['SUCCESS', 'PARTIAL', 'FAILED', 'HALTED'])
    .optional()
    .describe('Closing status (required for close phase)'),
  artifacts_created: z.array(z.string()).optional().describe('List of artifact paths created'),
  artifacts_modified: z.array(z.string()).optional().describe('List of artifact paths modified'),
  errors: z.array(z.string()).optional().describe('List of error descriptions'),
  recovery: z.string().optional().describe('Recovery notes for failed executions'),
  next_recommended: z.string().optional().describe('Recommended next workflow or action'),
  execution_log_content: z
    .string()
    .optional()
    .describe('Current raw YAML content of execution-log.yaml. Required in HTTP mode — the server will return the updated YAML to write back. Pass empty string if the file does not exist yet.'),
});

export type WriteExecutionEntryInput = z.infer<typeof WriteExecutionEntryInputSchema>;

export function writeExecutionEntry(
  projectReader: ProjectReader | null,
  input: WriteExecutionEntryInput,
): string {
  // Validate close phase requirements
  if (input.phase === 'close') {
    if (!input.id) return JSON.stringify({ error: 'id is required for close phase' });
    if (!input.status) return JSON.stringify({ error: 'status is required for close phase' });
  }

  const entryData: Record<string, unknown> = {
    agent: input.agent,
    trigger: input.trigger,
    workflow: input.workflow,
    mode: input.mode,
    status: input.phase === 'start' ? 'STARTED' : input.status,
    ...(input.phase === 'close' && { id: input.id }),
    artifacts_created: input.artifacts_created,
    artifacts_modified: input.artifacts_modified,
    errors: input.errors,
    recovery: input.recovery,
    next_recommended: input.next_recommended,
  };

  // Mode 1: Filesystem available — write directly
  if (projectReader?.isAvailable() && input.execution_log_content === undefined) {
    const log = new ExecutionLog(projectReader);
    const result = log.appendEntry(entryData);
    const statusMsg = input.phase === 'start' ? 'Execution started' : `Execution ${input.status!.toLowerCase()}`;
    return JSON.stringify({ message: statusMsg, id: result.id, started_at: result.started_at }, null, 2);
  }

  // Mode 2: Content-passthrough — parse input, build entry, return updated YAML
  const existingContent = input.execution_log_content || '';
  const entries = existingContent ? parseLogContent(existingContent) : [];
  const fullEntry = buildEntry(entryData, entries);
  entries.push(fullEntry);
  const updatedYaml = serializeLog(entries);
  const statusMsg = input.phase === 'start' ? 'Execution started' : `Execution ${input.status!.toLowerCase()}`;

  return JSON.stringify({
    message: statusMsg,
    id: fullEntry.id,
    started_at: fullEntry.started_at,
    target_file: '_bmad-output/execution-log.yaml',
    updated_content: updatedYaml,
    action: 'write_file',
    instruction: 'Write the updated_content to the target_file in your project root.',
  }, null, 2);
}
