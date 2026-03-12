import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { ExecutionLog, parseLogContent, filterEntries, findOrphans } from '../project/execution-log.js';

export const GetExecutionLogInputSchema = z.object({
  filter: z
    .enum(['all', 'orphans', 'errors'])
    .optional()
    .describe('Filter entries: all (default), orphans (STARTED without closing), errors (FAILED/HALTED)'),
  agent: z.string().optional().describe('Filter by agent name (e.g., "homer", "lisa")'),
  limit: z.number().optional().describe('Limit number of entries returned (most recent first)'),
  execution_log_content: z
    .string()
    .optional()
    .describe('Raw YAML content of execution-log.yaml. Pass this when the server cannot access the project filesystem (HTTP mode). The LLM should read the file locally and pass its content here.'),
});

export type GetExecutionLogInput = z.infer<typeof GetExecutionLogInputSchema>;

export function getExecutionLog(projectReader: ProjectReader | null, input: GetExecutionLogInput): string {
  let entries;

  if (input.execution_log_content !== undefined) {
    entries = parseLogContent(input.execution_log_content);
  } else if (projectReader?.isAvailable()) {
    const log = new ExecutionLog(projectReader);
    entries = log.read();
  } else {
    return JSON.stringify({
      error: 'No execution log data available. Pass execution_log_content with the raw YAML content of _bmad-output/execution-log.yaml',
      target_file: '_bmad-output/execution-log.yaml',
    });
  }

  if (input.filter === 'orphans') {
    const orphans = findOrphans(entries);
    return JSON.stringify({ orphans, count: orphans.length }, null, 2);
  }

  let filtered = filterEntries(entries, { agent: input.agent, limit: input.limit });

  if (input.filter === 'errors') {
    filtered = filtered.filter((e) => e.status === 'FAILED' || e.status === 'HALTED');
  }

  return JSON.stringify({ entries: filtered, count: filtered.length }, null, 2);
}
