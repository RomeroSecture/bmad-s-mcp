import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import yaml from 'js-yaml';
import type { ProjectReader } from './project-reader.js';

export interface LogEntry {
  id: string;
  agent: string;
  trigger: string;
  workflow: string;
  mode?: string;
  status: 'STARTED' | 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'HALTED' | 'SESSION_END_UNEXPECTED';
  started_at: string;
  completed_at?: string;
  artifacts_created?: string[];
  artifacts_modified?: string[];
  errors?: string[];
  recovery?: string;
  next_recommended?: string;
}

/** Parse execution log YAML content into LogEntry array */
export function parseLogContent(raw: string): LogEntry[] {
  try {
    const parsed = yaml.load(raw);
    if (Array.isArray(parsed)) return parsed as LogEntry[];
    if (parsed && typeof parsed === 'object' && 'executions' in parsed) {
      return (parsed as { executions: LogEntry[] }).executions || [];
    }
    return [];
  } catch {
    return [];
  }
}

/** Filter entries by criteria */
export function filterEntries(
  entries: LogEntry[],
  filter?: { status?: string; agent?: string; limit?: number },
): LogEntry[] {
  let result = [...entries];
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  if (filter?.agent) {
    result = result.filter((e) => e.agent?.toLowerCase() === filter.agent!.toLowerCase());
  }
  if (filter?.limit && filter.limit > 0) {
    result = result.slice(-filter.limit);
  }
  return result;
}

/** Find orphan entries (STARTED without a corresponding closing entry) */
export function findOrphans(entries: LogEntry[]): LogEntry[] {
  const closedIds = new Set<string>();
  for (const entry of entries) {
    if (entry.status !== 'STARTED') closedIds.add(entry.id);
  }
  return entries.filter((e) => e.status === 'STARTED' && !closedIds.has(e.id));
}

/** Build a full LogEntry from partial input */
export function buildEntry(entry: Partial<LogEntry>, existingEntries: LogEntry[]): LogEntry {
  const id = entry.id || generateId(existingEntries);
  const now = new Date().toISOString();
  const isStart = entry.status === 'STARTED' || !entry.status;

  return {
    id,
    agent: entry.agent || 'unknown',
    trigger: entry.trigger || 'unknown',
    workflow: entry.workflow || 'unknown',
    status: entry.status || 'STARTED',
    started_at: entry.started_at || now,
    ...(entry.mode && { mode: entry.mode }),
    ...(!isStart && { completed_at: entry.completed_at || now }),
    ...(entry.artifacts_created?.length && { artifacts_created: entry.artifacts_created }),
    ...(entry.artifacts_modified?.length && { artifacts_modified: entry.artifacts_modified }),
    ...(entry.errors?.length && { errors: entry.errors }),
    ...(entry.recovery && { recovery: entry.recovery }),
    ...(entry.next_recommended && { next_recommended: entry.next_recommended }),
  };
}

/** Serialize entries to YAML */
export function serializeLog(entries: LogEntry[]): string {
  return yaml.dump({ executions: entries }, { lineWidth: 120 });
}

/** Generate an auto-incremental ELP ID */
export function generateId(existingEntries: LogEntry[]): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const todayEntries = existingEntries.filter((e) => e.id?.startsWith(`ELP-${date}`));
  const seq = String(todayEntries.length + 1).padStart(3, '0');
  return `ELP-${date}-${seq}`;
}

/**
 * ExecutionLog with filesystem access.
 * Used when ProjectReader is available (stdio mode with project root).
 */
export class ExecutionLog {
  constructor(private reader: ProjectReader) {}

  private getLogPath(): string {
    return resolve(this.reader.getOutputDir(), 'execution-log.yaml');
  }

  read(filter?: { status?: string; agent?: string; limit?: number }): LogEntry[] {
    const logPath = this.getLogPath();
    if (!existsSync(logPath)) return [];
    const raw = readFileSync(logPath, 'utf-8');
    const entries = parseLogContent(raw);
    return filterEntries(entries, filter);
  }

  getOrphans(): LogEntry[] {
    return findOrphans(this.read());
  }

  appendEntry(entry: Partial<LogEntry>): { id: string; started_at: string } {
    const logPath = this.getLogPath();
    const dir = dirname(logPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const entries = existsSync(logPath) ? parseLogContent(readFileSync(logPath, 'utf-8')) : [];
    const fullEntry = buildEntry(entry, entries);
    entries.push(fullEntry);
    writeFileSync(logPath, serializeLog(entries), 'utf-8');

    return { id: fullEntry.id, started_at: fullEntry.started_at };
  }

  generateId(): string {
    return generateId(this.read());
  }
}
