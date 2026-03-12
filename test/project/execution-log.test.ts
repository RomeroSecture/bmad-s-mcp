import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { ExecutionLog } from '../../src/project/execution-log.js';
import { ProjectReader } from '../../src/project/project-reader.js';
import type { BmadConfig } from '../../src/config/schema.js';

const TMP = resolve(import.meta.dirname, '..', '.tmp-execution-log');

function makeConfig(): BmadConfig {
  return {
    project_name: 'TestProject',
    user_name: 'Test',
    communication_language: 'English',
    document_output_language: 'English',
    user_skill_level: 'intermediate',
    output_folder: `${TMP}/_bmad-output`,
    planning_artifacts: `${TMP}/_bmad-output/planning-artifacts`,
    implementation_artifacts: `${TMP}/_bmad-output/implementation-artifacts`,
    project_knowledge: `${TMP}/docs/project`,
    transport: 'stdio',
    http_port: 3000,
  };
}

describe('ExecutionLog', () => {
  let reader: ProjectReader;
  let log: ExecutionLog;

  beforeEach(() => {
    mkdirSync(resolve(TMP, '_bmad'), { recursive: true });
    mkdirSync(resolve(TMP, '_bmad-output'), { recursive: true });
    reader = new ProjectReader(makeConfig(), TMP);
    log = new ExecutionLog(reader);
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('read returns empty array when no log file', () => {
    expect(log.read()).toEqual([]);
  });

  it('appendEntry creates the log file and writes entry with started_at', () => {
    const result = log.appendEntry({
      agent: 'homer',
      trigger: 'DS',
      workflow: 'bmm/workflows/dev-story/workflow.md',
      status: 'STARTED',
    });

    expect(result.id).toMatch(/^ELP-\d{4}-\d{2}-\d{2}-001$/);
    expect(result.started_at).toBeTruthy();

    const logPath = resolve(TMP, '_bmad-output', 'execution-log.yaml');
    expect(existsSync(logPath)).toBe(true);

    const entries = log.read();
    expect(entries).toHaveLength(1);
    expect(entries[0].agent).toBe('homer');
    expect(entries[0].status).toBe('STARTED');
    expect(entries[0].started_at).toBeTruthy();
    expect(entries[0].completed_at).toBeUndefined();
  });

  it('closing entry has completed_at', () => {
    log.appendEntry({
      id: 'ELP-2026-01-01-001',
      agent: 'lisa',
      trigger: 'CP',
      workflow: 'w1',
      status: 'SUCCESS',
      artifacts_created: ['prd.md'],
      next_recommended: 'CA',
    });

    const entries = log.read();
    expect(entries).toHaveLength(1);
    expect(entries[0].completed_at).toBeTruthy();
    expect(entries[0].artifacts_created).toEqual(['prd.md']);
    expect(entries[0].next_recommended).toBe('CA');
  });

  it('appendEntry appends to existing log', () => {
    log.appendEntry({ agent: 'lisa', trigger: 'CP', workflow: 'w1', status: 'STARTED' });
    log.appendEntry({ id: 'ELP-2026-01-01-001', agent: 'lisa', trigger: 'CP', workflow: 'w1', status: 'SUCCESS' });

    const entries = log.read();
    expect(entries).toHaveLength(2);
  });

  it('read filters by agent', () => {
    log.appendEntry({ agent: 'homer', trigger: 'DS', workflow: 'w1', status: 'STARTED' });
    log.appendEntry({ agent: 'lisa', trigger: 'CP', workflow: 'w2', status: 'STARTED' });

    const homer = log.read({ agent: 'homer' });
    expect(homer).toHaveLength(1);
    expect(homer[0].agent).toBe('homer');
  });

  it('read filters by limit', () => {
    log.appendEntry({ agent: 'homer', trigger: 'DS', workflow: 'w1', status: 'STARTED' });
    log.appendEntry({ agent: 'lisa', trigger: 'CP', workflow: 'w2', status: 'STARTED' });
    log.appendEntry({ agent: 'frink', trigger: 'CA', workflow: 'w3', status: 'STARTED' });

    const limited = log.read({ limit: 2 });
    expect(limited).toHaveLength(2);
  });

  it('getOrphans returns STARTED entries without closing', () => {
    log.appendEntry({ id: 'ELP-2026-01-01-001', agent: 'homer', trigger: 'DS', workflow: 'w1', status: 'STARTED' });
    log.appendEntry({ id: 'ELP-2026-01-01-002', agent: 'lisa', trigger: 'CP', workflow: 'w2', status: 'STARTED' });
    log.appendEntry({ id: 'ELP-2026-01-01-001', agent: 'homer', trigger: 'DS', workflow: 'w1', status: 'SUCCESS' });

    const orphans = log.getOrphans();
    expect(orphans).toHaveLength(1);
    expect(orphans[0].id).toBe('ELP-2026-01-01-002');
  });

  it('generateId increments sequence for the same day', () => {
    log.appendEntry({ agent: 'homer', trigger: 'DS', workflow: 'w1', status: 'STARTED' });
    const id = log.generateId();
    expect(id).toMatch(/-002$/);
  });

  it('handles pre-existing YAML with executions wrapper', () => {
    const logPath = resolve(TMP, '_bmad-output', 'execution-log.yaml');
    const existing = {
      executions: [{
        id: 'ELP-2026-01-01-001',
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
        status: 'STARTED',
        started_at: '2026-01-01T00:00:00.000Z',
      }],
    };
    writeFileSync(logPath, yaml.dump(existing));

    const entries = log.read();
    expect(entries).toHaveLength(1);
    expect(entries[0].agent).toBe('homer');
  });

  it('supports artifacts_created and artifacts_modified', () => {
    log.appendEntry({
      id: 'ELP-2026-01-01-001',
      agent: 'homer',
      trigger: 'DS',
      workflow: 'w1',
      status: 'SUCCESS',
      artifacts_created: ['src/auth.ts'],
      artifacts_modified: ['src/router.ts'],
    });

    const entries = log.read();
    expect(entries[0].artifacts_created).toEqual(['src/auth.ts']);
    expect(entries[0].artifacts_modified).toEqual(['src/router.ts']);
  });
});
