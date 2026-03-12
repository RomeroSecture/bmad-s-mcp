import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { ProjectReader } from '../../src/project/project-reader.js';
import { getExecutionLog } from '../../src/tools/get-execution-log.js';
import { writeExecutionEntry } from '../../src/tools/write-execution-entry.js';
import { getProjectStatus } from '../../src/tools/get-project-status.js';
import { getSprintStatus } from '../../src/tools/get-sprint-status.js';
import { listStories } from '../../src/tools/list-stories.js';
import { getStory } from '../../src/tools/get-story.js';
import { getArtifactInventory } from '../../src/tools/get-artifact-inventory.js';
import { recoverExecution } from '../../src/tools/recover-execution.js';
import type { BmadConfig } from '../../src/config/schema.js';

const TMP = resolve(import.meta.dirname, '..', '.tmp-project-tools');

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

describe('Project Tools', () => {
  let projectReader: ProjectReader;
  const outputDir = resolve(TMP, '_bmad-output');
  const planningDir = resolve(TMP, '_bmad-output', 'planning-artifacts');
  const implDir = resolve(TMP, '_bmad-output', 'implementation-artifacts');

  beforeEach(() => {
    mkdirSync(resolve(TMP, '_bmad'), { recursive: true });
    mkdirSync(outputDir, { recursive: true });
    mkdirSync(planningDir, { recursive: true });
    mkdirSync(implDir, { recursive: true });
    projectReader = new ProjectReader(makeConfig(), TMP);
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  describe('getExecutionLog', () => {
    it('returns empty entries when no log', () => {
      const result = JSON.parse(getExecutionLog(projectReader, {}));
      expect(result.entries).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('returns entries after writing', () => {
      writeExecutionEntry(projectReader, {
        phase: 'start',
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
      });

      const result = JSON.parse(getExecutionLog(projectReader, {}));
      expect(result.count).toBe(1);
      expect(result.entries[0].agent).toBe('homer');
    });

    it('filters orphans', () => {
      writeExecutionEntry(projectReader, {
        phase: 'start',
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
      });

      const result = JSON.parse(getExecutionLog(projectReader, { filter: 'orphans' }));
      expect(result.count).toBe(1);
    });
  });

  describe('writeExecutionEntry', () => {
    it('start phase creates entry with auto-generated ID', () => {
      const result = JSON.parse(writeExecutionEntry(projectReader, {
        phase: 'start',
        agent: 'lisa',
        trigger: 'CP',
        workflow: 'w1',
      }));

      expect(result.message).toBe('Execution started');
      expect(result.id).toMatch(/^ELP-/);
    });

    it('close phase requires id', () => {
      const result = JSON.parse(writeExecutionEntry(projectReader, {
        phase: 'close',
        agent: 'lisa',
        trigger: 'CP',
        workflow: 'w1',
      }));

      expect(result.error).toContain('id is required');
    });

    it('close phase requires status', () => {
      const result = JSON.parse(writeExecutionEntry(projectReader, {
        phase: 'close',
        id: 'ELP-2026-01-01-001',
        agent: 'lisa',
        trigger: 'CP',
        workflow: 'w1',
      }));

      expect(result.error).toContain('status is required');
    });

    it('close phase writes closing entry', () => {
      const result = JSON.parse(writeExecutionEntry(projectReader, {
        phase: 'close',
        id: 'ELP-2026-01-01-001',
        agent: 'lisa',
        trigger: 'CP',
        workflow: 'w1',
        status: 'SUCCESS',
        artifacts_created: ['prd.md'],
        next_recommended: 'CA',
      }));

      expect(result.message).toBe('Execution success');
    });
  });

  describe('getProjectStatus', () => {
    it('returns all sections by default', () => {
      const result = JSON.parse(getProjectStatus(projectReader, {}));
      expect(result).toHaveProperty('artifacts');
      expect(result).toHaveProperty('recent_executions');
      expect(result).toHaveProperty('orphan_executions');
      expect(result).toHaveProperty('sprint');
    });

    it('filters sections by include param', () => {
      const result = JSON.parse(getProjectStatus(projectReader, { include: ['artifacts'] }));
      expect(result).toHaveProperty('artifacts');
      expect(result).not.toHaveProperty('sprint');
    });
  });

  describe('getSprintStatus', () => {
    it('returns null when no sprint status', () => {
      expect(getSprintStatus(projectReader, {})).toBeNull();
    });

    it('returns content when file exists', () => {
      writeFileSync(resolve(implDir, 'sprint-status.yaml'), 'sprint: 1');
      expect(getSprintStatus(projectReader, {})).toContain('sprint: 1');
    });
  });

  describe('listStories', () => {
    it('returns empty when no stories', () => {
      const result = JSON.parse(listStories(projectReader, {}));
      expect(result).toEqual([]);
    });

    it('lists story files', () => {
      writeFileSync(resolve(implDir, 'S001-login.md'), '---\nstatus: draft\n---\n# Login');
      const result = JSON.parse(listStories(projectReader, {}));
      expect(result).toHaveLength(1);
    });
  });

  describe('getStory', () => {
    it('returns story content', () => {
      writeFileSync(resolve(implDir, 'S001-login.md'), '# Login Story');
      expect(getStory(projectReader, { story_id: 'S001' })).toContain('Login Story');
    });

    it('returns null for missing story', () => {
      expect(getStory(projectReader, { story_id: 'S999' })).toBeNull();
    });
  });

  describe('getArtifactInventory', () => {
    it('returns inventory with coverage and recommended_mode', () => {
      writeFileSync(resolve(planningDir, 'prd.md'), '# PRD');
      const result = JSON.parse(getArtifactInventory(projectReader, {}));
      expect(result.planning.prd.exists).toBe(true);
      expect(result.coverage_estimate).toBeGreaterThan(0);
      expect(result.recommended_mode).toBeDefined();
      expect(result.mode_reasoning).toBeTruthy();
    });

    it('respects scope filter', () => {
      writeFileSync(resolve(planningDir, 'prd.md'), '# PRD');
      const result = JSON.parse(getArtifactInventory(projectReader, { scope: 'implementation' }));
      // Planning artifacts not scanned in implementation scope
      expect(result.planning.prd.exists).toBe(false);
    });
  });

  describe('recoverExecution', () => {
    it('diagnose returns orphans and failures', () => {
      writeExecutionEntry(projectReader, {
        phase: 'start',
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
      });

      const result = JSON.parse(recoverExecution(projectReader, { action: 'diagnose' }));
      expect(result.summary.orphan_count).toBe(1);
      expect(result.orphan_executions).toHaveLength(1);
      expect(result.orphan_executions[0].suggestion).toContain('bmad_recover_execution');
    });

    it('resolve closes an orphan execution', () => {
      const started = JSON.parse(writeExecutionEntry(projectReader, {
        phase: 'start',
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
      }));

      const result = JSON.parse(recoverExecution(projectReader, {
        action: 'resolve',
        id: started.id,
        status: 'HALTED',
        recovery: 'Session crashed, resolved manually',
      }));

      expect(result.message).toContain('resolved as HALTED');

      // Verify orphan is now closed
      const diag = JSON.parse(recoverExecution(projectReader, { action: 'diagnose' }));
      expect(diag.summary.orphan_count).toBe(0);
    });

    it('resolve fails without id', () => {
      const result = JSON.parse(recoverExecution(projectReader, { action: 'resolve', status: 'FAILED' }));
      expect(result.error).toContain('id is required');
    });

    it('resolve fails for non-orphan execution', () => {
      const started = JSON.parse(writeExecutionEntry(projectReader, {
        phase: 'start',
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
      }));
      // Close it
      writeExecutionEntry(projectReader, {
        phase: 'close',
        id: started.id,
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
        status: 'SUCCESS',
      });

      const result = JSON.parse(recoverExecution(projectReader, {
        action: 'resolve',
        id: started.id,
        status: 'FAILED',
      }));
      expect(result.error).toContain('not an orphan');
    });
  });

  // === Content-passthrough mode tests (HTTP / no filesystem) ===

  describe('content-passthrough: getExecutionLog', () => {
    it('parses execution_log_content without filesystem', () => {
      const yamlContent = `executions:\n  - id: ELP-2026-01-01-001\n    agent: homer\n    trigger: DS\n    workflow: w1\n    status: STARTED\n    started_at: '2026-01-01T00:00:00Z'`;
      const result = JSON.parse(getExecutionLog(null, { execution_log_content: yamlContent }));
      expect(result.count).toBe(1);
      expect(result.entries[0].agent).toBe('homer');
    });

    it('handles empty string as empty log', () => {
      const result = JSON.parse(getExecutionLog(null, { execution_log_content: '' }));
      expect(result.count).toBe(0);
      expect(result.entries).toEqual([]);
    });

    it('returns error when no data and no filesystem', () => {
      const result = JSON.parse(getExecutionLog(null, {}));
      expect(result.error).toBeDefined();
    });
  });

  describe('content-passthrough: writeExecutionEntry', () => {
    it('returns updated_content for start phase', () => {
      const result = JSON.parse(writeExecutionEntry(null, {
        phase: 'start',
        agent: 'lisa',
        trigger: 'CP',
        workflow: 'w1',
        execution_log_content: '',
      }));
      expect(result.message).toBe('Execution started');
      expect(result.id).toMatch(/^ELP-/);
      expect(result.updated_content).toContain('lisa');
      expect(result.target_file).toBe('_bmad-output/execution-log.yaml');
      expect(result.action).toBe('write_file');
    });

    it('appends to existing content', () => {
      const existing = `executions:\n  - id: ELP-2026-01-01-001\n    agent: homer\n    trigger: DS\n    workflow: w1\n    status: STARTED\n    started_at: '2026-01-01T00:00:00Z'`;
      const result = JSON.parse(writeExecutionEntry(null, {
        phase: 'start',
        agent: 'lisa',
        trigger: 'CP',
        workflow: 'w2',
        execution_log_content: existing,
      }));
      expect(result.updated_content).toContain('homer');
      expect(result.updated_content).toContain('lisa');
    });
  });

  describe('content-passthrough: getArtifactInventory', () => {
    it('calculates coverage from file lists', () => {
      const result = JSON.parse(getArtifactInventory(null, {
        planning_files: ['prd.md', 'architecture.md'],
        implementation_files: ['sprint-status.yaml', 'S001-auth.md'],
      }));
      expect(result.planning.prd.exists).toBe(true);
      expect(result.planning.architecture.exists).toBe(true);
      expect(result.implementation.sprint_status.exists).toBe(true);
      expect(result.coverage_estimate).toBeGreaterThan(0);
      expect(result.recommended_mode).toBeDefined();
    });

    it('returns error when no data and no filesystem', () => {
      const result = JSON.parse(getArtifactInventory(null, {}));
      expect(result.error).toBeDefined();
    });
  });

  describe('content-passthrough: getSprintStatus', () => {
    it('returns content when passed', () => {
      expect(getSprintStatus(null, { content: 'sprint: 1' })).toBe('sprint: 1');
    });

    it('returns null when no data and no filesystem', () => {
      expect(getSprintStatus(null, {})).toBeNull();
    });
  });

  describe('content-passthrough: listStories', () => {
    it('returns stories from stories_data', () => {
      const result = JSON.parse(listStories(null, {
        stories_data: [
          { filename: 'S001-login.md', status: 'draft' },
          { filename: 'S002-api.md', status: 'done', epic: 'auth' },
        ],
      }));
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('s001');
    });

    it('filters stories_data by status', () => {
      const result = JSON.parse(listStories(null, {
        status: 'done',
        stories_data: [
          { filename: 'S001-login.md', status: 'draft' },
          { filename: 'S002-api.md', status: 'done' },
        ],
      }));
      expect(result).toHaveLength(1);
    });
  });

  describe('content-passthrough: getStory', () => {
    it('returns content when passed', () => {
      expect(getStory(null, { story_id: 'S001', content: '# My Story' })).toBe('# My Story');
    });

    it('returns message for empty content', () => {
      expect(getStory(null, { story_id: 'S001', content: '' })).toBe('Story file is empty');
    });
  });

  describe('content-passthrough: recoverExecution', () => {
    it('diagnoses from execution_log_content', () => {
      const yamlContent = `executions:\n  - id: ELP-2026-01-01-001\n    agent: homer\n    trigger: DS\n    workflow: w1\n    status: STARTED\n    started_at: '2026-01-01T00:00:00Z'`;
      const result = JSON.parse(recoverExecution(null, {
        action: 'diagnose',
        execution_log_content: yamlContent,
      }));
      expect(result.summary.orphan_count).toBe(1);
    });

    it('resolves and returns updated content', () => {
      const yamlContent = `executions:\n  - id: ELP-2026-01-01-001\n    agent: homer\n    trigger: DS\n    workflow: w1\n    status: STARTED\n    started_at: '2026-01-01T00:00:00Z'`;
      const result = JSON.parse(recoverExecution(null, {
        action: 'resolve',
        id: 'ELP-2026-01-01-001',
        status: 'HALTED',
        recovery: 'Manual fix',
        execution_log_content: yamlContent,
      }));
      expect(result.message).toContain('resolved as HALTED');
      expect(result.updated_content).toContain('HALTED');
      expect(result.target_file).toBe('_bmad-output/execution-log.yaml');
    });
  });

  describe('content-passthrough: getProjectStatus', () => {
    it('works with passthrough data', () => {
      const logContent = `executions:\n  - id: ELP-001\n    agent: homer\n    trigger: DS\n    workflow: w1\n    status: STARTED\n    started_at: '2026-01-01T00:00:00Z'`;
      const result = JSON.parse(getProjectStatus(null, {
        execution_log_content: logContent,
        planning_files: ['prd.md'],
        stories_data: [{ id: 's001', filename: 'S001.md', status: 'draft' }],
      }));
      expect(result).toHaveProperty('artifacts');
      expect(result).toHaveProperty('recent_executions');
      expect(result).toHaveProperty('orphan_executions');
      expect(result).toHaveProperty('sprint');
      expect(result).toHaveProperty('inconsistencies');
    });
  });

  describe('getProjectStatus — inconsistencies', () => {
    it('includes inconsistencies section', () => {
      const result = JSON.parse(getProjectStatus(projectReader, {}));
      expect(result).toHaveProperty('inconsistencies');
      expect(Array.isArray(result.inconsistencies)).toBe(true);
    });

    it('detects orphan executions as inconsistencies', () => {
      writeExecutionEntry(projectReader, {
        phase: 'start',
        agent: 'homer',
        trigger: 'DS',
        workflow: 'w1',
      });

      const result = JSON.parse(getProjectStatus(projectReader, { include: ['inconsistencies'] }));
      const orphanIssues = result.inconsistencies.filter(
        (i: { type: string }) => i.type === 'orphan_execution',
      );
      expect(orphanIssues.length).toBe(1);
    });
  });
});
