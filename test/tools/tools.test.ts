import { describe, it, expect, afterEach } from 'vitest';
import { createTestRegistry, createTestReader } from '../helpers.js';
import { listAgents } from '../../src/tools/list-agents.js';
import { getAgent } from '../../src/tools/get-agent.js';
import { listWorkflows } from '../../src/tools/list-workflows.js';
import { getWorkflow } from '../../src/tools/get-workflow.js';
import { getStep } from '../../src/tools/get-step.js';
import { getTemplate } from '../../src/tools/get-template.js';
import { getData } from '../../src/tools/get-data.js';
import { getTask } from '../../src/tools/get-task.js';
import { getProtocol } from '../../src/tools/get-protocol.js';
import { listTemplates } from '../../src/tools/list-templates.js';
import { listData } from '../../src/tools/list-data.js';
import { listDocs } from '../../src/tools/list-docs.js';
import { getDoc } from '../../src/tools/get-doc.js';
import { getChecklist } from '../../src/tools/get-checklist.js';
import { searchContent } from '../../src/tools/search-content.js';
import { getConfig } from '../../src/tools/get-config.js';
import { bmadHelp } from '../../src/tools/bmad-help.js';

const registry = createTestRegistry();
const reader = createTestReader(registry);

describe('listAgents', () => {
  it('lists all agents across modules', () => {
    const result = listAgents(registry, reader, { module: 'all' });
    expect(result.length).toBeGreaterThanOrEqual(2);
    const names = result.map((a) => a.name);
    expect(names).toContain('Smithers');
    expect(names).toContain('Lisa');
  });

  it('filters agents by module', () => {
    const core = listAgents(registry, reader, { module: 'core' });
    expect(core.every((a) => a.module === 'core')).toBe(true);
    const names = core.map((a) => a.name);
    expect(names).toContain('Smithers');
    expect(names).not.toContain('Lisa');
  });

  it('returns agent summaries with all fields', () => {
    const all = listAgents(registry, reader, { module: 'all' });
    const smithers = all.find((a) => a.name === 'Smithers')!;
    expect(smithers.id).toContain('smithers.agent.yaml');
    expect(smithers.title).toBe('Project Setup Specialist');
    expect(smithers.icon).toBe('🤵');
    expect(smithers.role).toContain('Sets up');
  });

  it('extracts menu trigger codes', () => {
    const all = listAgents(registry, reader, { module: 'all' });
    const lisa = all.find((a) => a.name === 'Lisa')!;
    expect(lisa.menu_codes).toContain('CP');
    expect(lisa.menu_codes).toContain('CE');
    expect(lisa.menu_codes).toContain('IR');
  });
});

describe('getAgent', () => {
  it('finds agent by exact file path', () => {
    const result = getAgent(registry, reader, { agent_id: 'core/agents/smithers.agent.yaml' });
    expect(result).not.toBeNull();
    expect(result).toContain('Smithers');
  });

  it('finds agent by name "smithers"', () => {
    const result = getAgent(registry, reader, { agent_id: 'smithers' });
    expect(result).not.toBeNull();
    expect(result).toContain('Smithers');
  });

  it('finds agent by name "lisa"', () => {
    const result = getAgent(registry, reader, { agent_id: 'lisa' });
    expect(result).not.toBeNull();
    expect(result).toContain('Lisa');
    expect(result).toContain('Product Manager');
  });

  it('name matching is case-insensitive', () => {
    const result = getAgent(registry, reader, { agent_id: 'LISA' });
    expect(result).not.toBeNull();
    expect(result).toContain('Lisa');
  });

  it('returns null for non-existent agent', () => {
    expect(getAgent(registry, reader, { agent_id: 'nonexistent' })).toBeNull();
  });
});

describe('listWorkflows', () => {
  it('lists all workflows from module-help.csv files', () => {
    const result = listWorkflows(registry, reader, {});
    expect(result.length).toBeGreaterThanOrEqual(3);
    const codes = result.map((w) => w.code);
    expect(codes).toContain('SO');
    expect(codes).toContain('CP');
  });

  it('filters by module', () => {
    const result = listWorkflows(registry, reader, { module: 'bmm' });
    expect(result.every((w) => w.module === 'bmm')).toBe(true);
  });

  it('filters by phase', () => {
    const result = listWorkflows(registry, reader, { phase: 'setup' });
    expect(result.every((w) => w.phase.includes('setup'))).toBe(true);
  });
});

describe('getWorkflow', () => {
  it('finds workflow by code', () => {
    const result = getWorkflow(registry, reader, { workflow_code: 'SO' });
    expect(result).not.toBeNull();
    expect(result!.content).toContain('Setup Workflow');
    expect(result!.path).toContain('workflow.md');
  });

  it('finds workflow by code case-insensitively', () => {
    const result = getWorkflow(registry, reader, { workflow_code: 'so' });
    expect(result).not.toBeNull();
  });

  it('finds workflow by direct path', () => {
    const result = getWorkflow(registry, reader, { workflow_path: 'core/workflows/setup/workflow.md' });
    expect(result).not.toBeNull();
    expect(result!.content).toContain('Setup Workflow');
  });

  it('returns null for non-existent workflow', () => {
    expect(getWorkflow(registry, reader, { workflow_code: 'NONEXISTENT' })).toBeNull();
  });

  it('returns null when neither code nor path is provided', () => {
    expect(getWorkflow(registry, reader, {})).toBeNull();
  });
});

describe('getStep', () => {
  it('reads a step file from a workflow', () => {
    const result = getStep(registry, reader, {
      workflow_path: 'core/workflows/setup',
      step_file: 'step-01.md',
      steps_dir: 'steps',
    });
    expect(result).not.toBeNull();
    expect(result).toContain('Project Initialization');
  });

  it('handles workflow_path pointing to a file', () => {
    const result = getStep(registry, reader, {
      workflow_path: 'core/workflows/setup/workflow.md',
      step_file: 'step-02.md',
      steps_dir: 'steps',
    });
    expect(result).not.toBeNull();
    expect(result).toContain('Configuration');
  });

  it('returns null for non-existent step', () => {
    const result = getStep(registry, reader, {
      workflow_path: 'core/workflows/setup',
      step_file: 'step-99.md',
      steps_dir: 'steps',
    });
    expect(result).toBeNull();
  });
});

describe('getTemplate', () => {
  it('reads a template file', () => {
    const result = getTemplate(registry, reader, { template_path: 'core/templates/prd-template.md' });
    expect(result).not.toBeNull();
    expect(result).toContain('Product Requirements Document');
  });

  it('returns null for non-existent template', () => {
    expect(getTemplate(registry, reader, { template_path: 'nonexistent.md' })).toBeNull();
  });
});

describe('getData', () => {
  it('reads a data file', () => {
    const result = getData(registry, reader, { data_path: 'core/data/module-help.csv' });
    expect(result).not.toBeNull();
    expect(result).toContain('SO');
  });

  it('returns null for non-existent data', () => {
    expect(getData(registry, reader, { data_path: 'nonexistent.csv' })).toBeNull();
  });
});

describe('getTask', () => {
  it('finds task by exact name', () => {
    const result = getTask(registry, reader, { task_name: 'workflow' });
    expect(result).not.toBeNull();
    expect(result).toContain('workflow-engine');
  });

  it('finds task by name case-insensitively', () => {
    const result = getTask(registry, reader, { task_name: 'HELP' });
    expect(result).not.toBeNull();
    expect(result).toContain('Help Routing Task');
  });

  it('returns null for non-existent task', () => {
    expect(getTask(registry, reader, { task_name: 'nonexistent' })).toBeNull();
  });
});

describe('getProtocol', () => {
  it('finds protocol by name', () => {
    const result = getProtocol(registry, reader, { protocol_name: 'execution-logging-protocol' });
    expect(result).not.toBeNull();
    expect(result).toContain('Execution Logging Protocol');
  });

  it('finds protocol by abbreviation (ELP)', () => {
    const result = getProtocol(registry, reader, { protocol_name: 'ELP' });
    expect(result).not.toBeNull();
    expect(result).toContain('Execution Logging Protocol');
  });

  it('returns null for non-existent protocol', () => {
    expect(getProtocol(registry, reader, { protocol_name: 'nonexistent' })).toBeNull();
  });
});

describe('listTemplates', () => {
  it('lists all templates', () => {
    const result = listTemplates(registry, { module: 'all' });
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every((t) => t.path && t.module && t.name)).toBe(true);
  });

  it('filters by module', () => {
    const result = listTemplates(registry, { module: 'core' });
    expect(result.every((t) => t.module === 'core')).toBe(true);
  });
});

describe('listData', () => {
  it('lists all data and protocol files', () => {
    const result = listData(registry, { category: 'all' });
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('filters by data category', () => {
    const result = listData(registry, { category: 'data' });
    expect(result.every((d) => d.category === 'data')).toBe(true);
  });

  it('filters by protocols category', () => {
    const result = listData(registry, { category: 'protocols' });
    expect(result.every((d) => d.category === 'protocol')).toBe(true);
  });
});

describe('listDocs', () => {
  it('lists all documentation files', () => {
    const result = listDocs(registry, { category: 'all' });
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every((d) => d.title && d.path && d.category)).toBe(true);
  });

  it('infers category from directory structure', () => {
    const result = listDocs(registry, { category: 'all' });
    const howTo = result.find((d) => d.path.includes('how-to/'));
    expect(howTo?.category).toBe('how-to');
  });

  it('filters by category', () => {
    const result = listDocs(registry, { category: 'how-to' });
    expect(result.every((d) => d.category === 'how-to')).toBe(true);
  });

  it('excludes files starting with underscore', () => {
    const result = listDocs(registry, { category: 'all' });
    expect(result.every((d) => !d.path.split('/').pop()!.startsWith('_'))).toBe(true);
  });
});

describe('getDoc', () => {
  it('finds doc by direct path', () => {
    const result = getDoc(registry, reader, { doc_path: 'docs/bmad-overview.md' });
    expect(result).not.toBeNull();
    expect(result).toContain('BMAD-S Method Overview');
  });

  it('finds doc by topic (filename match)', () => {
    const result = getDoc(registry, reader, { topic: 'bmad-overview' });
    expect(result).not.toBeNull();
    expect(result).toContain('BMAD-S Method Overview');
  });

  it('finds doc by topic with spaces', () => {
    const result = getDoc(registry, reader, { topic: 'getting started' });
    expect(result).not.toBeNull();
    expect(result).toContain('Getting Started');
  });

  it('returns null for non-existent doc', () => {
    expect(getDoc(registry, reader, { doc_path: 'docs/nonexistent.md' })).toBeNull();
    expect(getDoc(registry, reader, { topic: 'nonexistent-topic' })).toBeNull();
  });

  it('returns null when neither path nor topic is provided', () => {
    expect(getDoc(registry, reader, {})).toBeNull();
  });
});

describe('getChecklist', () => {
  it('returns null when no checklist exists for a workflow', () => {
    const result = getChecklist(registry, reader, { workflow_path: 'core/workflows/setup' });
    expect(result).toBeNull();
  });
});

describe('searchContent', () => {
  it('finds content by keyword', () => {
    const result = searchContent(registry, reader, { query: 'Smithers' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].matches.length).toBeGreaterThan(0);
  });

  it('is case insensitive', () => {
    const result = searchContent(registry, reader, { query: 'smithers' });
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('filters by file types', () => {
    const result = searchContent(registry, reader, {
      query: 'workflow',
      file_types: ['md'],
    });
    expect(result.every((r) => r.path.endsWith('.md'))).toBe(true);
  });

  it('caps results at 20', () => {
    const result = searchContent(registry, reader, { query: 'a' });
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('caps matches per file at 5', () => {
    const result = searchContent(registry, reader, { query: 'a' });
    for (const r of result) {
      expect(r.matches.length).toBeLessThanOrEqual(5);
    }
  });

  it('returns empty for no matches', () => {
    const result = searchContent(registry, reader, { query: 'xyznonexistent123' });
    expect(result).toEqual([]);
  });
});

describe('getConfig', () => {
  afterEach(() => {
    delete process.env.BMAD_PROJECT_NAME;
  });

  it('returns YAML string of resolved config', () => {
    const result = getConfig({ project_root: '/tmp/test-project' });
    expect(result).toContain('project_name');
    expect(result).toContain('test-project');
  });

  it('respects env var overrides', () => {
    process.env.BMAD_PROJECT_NAME = 'EnvProject';
    const result = getConfig({});
    expect(result).toContain('EnvProject');
  });
});

describe('bmadHelp', () => {
  it('returns markdown with workflows grouped by phase', () => {
    const result = bmadHelp(registry, reader, {});
    expect(result).toContain('# BMAD Method - Available Workflows');
    expect(result).toContain('Phase:');
    expect(result).toContain('SO');
    expect(result).toContain('CP');
  });

  it('includes context-aware routing when context is provided', () => {
    const result = bmadHelp(registry, reader, { context: 'just finished PRD' });
    expect(result).toContain('Context-Aware Routing');
    expect(result).toContain('just finished PRD');
  });

  it('includes project name from config', () => {
    const result = bmadHelp(registry, reader, { project_root: '/tmp/my-project' });
    expect(result).toContain('my-project');
  });
});
