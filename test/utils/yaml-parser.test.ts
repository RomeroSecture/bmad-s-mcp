import { describe, it, expect } from 'vitest';
import { parseAgentYaml, parseYamlFile } from '../../src/utils/yaml-parser.js';

describe('parseAgentYaml', () => {
  const validAgentYaml = `
agent:
  metadata:
    id: lisa
    name: Lisa
    title: Product Manager
    icon: "📋"
    module: bmm
    hasSidecar: true
  persona:
    role: Manages product requirements
    identity: A strategic thinker
    communication_style: Clear and structured
    principles: Data-driven
  critical_actions:
    - Verify requirements
    - Create PRD
  menu:
    - trigger: "CP - Create PRD"
      workflow: bmm/workflows/create-prd/workflow.md
      description: Create a Product Requirements Document
    - trigger: "CE - Create Epics"
      workflow: bmm/workflows/create-epics/workflow.md
      description: Break PRD into epics
`;

  it('parses valid agent YAML with all fields', () => {
    const result = parseAgentYaml(validAgentYaml);
    expect(result).not.toBeNull();
    expect(result!.metadata.id).toBe('lisa');
    expect(result!.metadata.name).toBe('Lisa');
    expect(result!.metadata.title).toBe('Product Manager');
    expect(result!.metadata.icon).toBe('📋');
    expect(result!.metadata.module).toBe('bmm');
    expect(result!.metadata.hasSidecar).toBe(true);
  });

  it('parses persona section', () => {
    const result = parseAgentYaml(validAgentYaml);
    expect(result!.persona.role).toBe('Manages product requirements');
    expect(result!.persona.identity).toBe('A strategic thinker');
    expect(result!.persona.communication_style).toBe('Clear and structured');
  });

  it('parses critical_actions as array', () => {
    const result = parseAgentYaml(validAgentYaml);
    expect(result!.critical_actions).toEqual(['Verify requirements', 'Create PRD']);
  });

  it('parses menu items with triggers', () => {
    const result = parseAgentYaml(validAgentYaml);
    expect(result!.menu).toHaveLength(2);
    expect(result!.menu[0].trigger).toBe('CP - Create PRD');
    expect(result!.menu[1].trigger).toBe('CE - Create Epics');
  });

  it('returns null for invalid YAML', () => {
    expect(parseAgentYaml('{{{')).toBeNull();
  });

  it('returns null for YAML without agent.metadata', () => {
    expect(parseAgentYaml('foo: bar')).toBeNull();
    expect(parseAgentYaml('agent:\n  persona:\n    role: test')).toBeNull();
  });

  it('defaults missing fields to empty strings', () => {
    const minimal = `
agent:
  metadata:
    name: Test
`;
    const result = parseAgentYaml(minimal);
    expect(result).not.toBeNull();
    expect(result!.metadata.id).toBe('');
    expect(result!.metadata.icon).toBe('');
    expect(result!.metadata.hasSidecar).toBe(false);
    expect(result!.persona.role).toBe('');
    expect(result!.menu).toEqual([]);
  });

  it('parses agent YAML with single-quoted tool calls in menu items', () => {
    const agentWithToolCalls = `
agent:
  metadata:
    name: Test
    title: Test Agent
    icon: "🧪"
    module: bmm
    hasSidecar: false
  persona:
    role: Test role
  menu:
    - trigger: CP or fuzzy match on create-prd
      exec: "bmad_get_workflow({ 'workflow_path': 'bmm/workflows/create-prd/workflow.md' })"
      description: "Create PRD"
    - trigger: CE or fuzzy match on create-epics
      workflow: "bmad_get_workflow({ 'workflow_path': 'bmm/workflows/create-epics/workflow.md' })"
      description: "Create Epics"
`;
    const result = parseAgentYaml(agentWithToolCalls);
    expect(result).not.toBeNull();
    expect(result!.metadata.name).toBe('Test');
    expect(result!.menu).toHaveLength(2);
    expect(result!.menu[0].exec).toContain('bmad_get_workflow');
    expect(result!.menu[1].workflow).toContain('bmad_get_workflow');
  });

  it('fails to parse double-quoted tool calls in YAML (the bug we fixed)', () => {
    // This is the invalid YAML that the old content-sync produced.
    // Nested double quotes break the YAML parser.
    const brokenYaml = `
agent:
  metadata:
    name: Test
  menu:
    - trigger: CP
      exec: "bmad_get_workflow({ "workflow_path": "test" })"
      description: "Test"
`;
    expect(parseAgentYaml(brokenYaml)).toBeNull();
  });
});

describe('parseYamlFile', () => {
  it('parses valid YAML into an object', () => {
    const result = parseYamlFile<{ name: string }>('name: test');
    expect(result).toEqual({ name: 'test' });
  });

  it('parses YAML arrays', () => {
    const result = parseYamlFile<string[]>('- one\n- two\n- three');
    expect(result).toEqual(['one', 'two', 'three']);
  });

  it('returns null for invalid YAML', () => {
    expect(parseYamlFile('{{{invalid')).toBeNull();
  });
});
