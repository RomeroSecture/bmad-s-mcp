import { parse } from 'csv-parse/sync';

export interface WorkflowEntry {
  module: string;
  phase: string;
  name: string;
  code: string;
  sequence: string;
  workflow_file: string;
  command: string;
  required: boolean;
  agent: string;
  options: string;
  description: string;
  output_location: string;
  outputs: string;
}

export function parseModuleHelp(csvContent: string): WorkflowEntry[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  return records
    .filter((r) => r.name && r.name.trim())
    .map((r) => ({
      module: (r.module || '').trim(),
      phase: (r.phase || '').trim(),
      name: (r.name || '').trim(),
      code: (r.code || '').trim(),
      sequence: (r.sequence || '').trim(),
      workflow_file: (r['workflow-file'] || '').trim(),
      command: (r.command || '').trim(),
      required: (r.required || '').trim().toLowerCase() === 'true',
      agent: (r.agent || '').trim(),
      options: (r.options || '').trim(),
      description: (r.description || '').trim(),
      output_location: (r['output-location'] || '').trim(),
      outputs: (r.outputs || '').trim(),
    }));
}
