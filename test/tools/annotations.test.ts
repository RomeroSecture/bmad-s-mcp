import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests that all 25 tools are registered with correct annotations.
 *
 * We mock the McpServer to capture all registerTool() calls and verify
 * each one includes the correct annotation hints.
 */
describe('Tool Annotations', () => {
  const toolCalls: Array<{
    name: string;
    description: string;
    annotations: Record<string, unknown>;
  }> = [];

  beforeEach(async () => {
    toolCalls.length = 0;

    // Mock McpServer to capture tool registrations
    const mockServer = {
      registerTool: vi.fn((...args: unknown[]) => {
        // server.registerTool(name, config, handler)
        const name = args[0] as string;
        const config = args[1] as { description?: string; annotations?: Record<string, unknown> };
        toolCalls.push({
          name,
          description: config.description || '',
          annotations: config.annotations || {},
        });
      }),
    };

    const mockRegistry = {
      getAll: () => [],
      getByType: () => [],
      getByModule: () => [],
      getByTypeAndModule: () => [],
      findByPath: () => undefined,
      search: () => [],
      size: 0,
      getContentRoot: () => '/tmp/test',
    };

    const { registerTools } = await import('../../src/tools/index.js');
    registerTools(mockServer as any, mockRegistry as any);
  });

  it('registers exactly 26 tools', () => {
    expect(toolCalls).toHaveLength(26);
  });

  const expectedTools = [
    'bmad_list_agents',
    'bmad_get_agent',
    'bmad_list_workflows',
    'bmad_get_workflow',
    'bmad_get_step',
    'bmad_get_template',
    'bmad_get_data',
    'bmad_get_task',
    'bmad_get_config',
    'bmad_help',
    'bmad_get_protocol',
    'bmad_list_templates',
    'bmad_list_data',
    'bmad_get_checklist',
    'bmad_search_content',
    'bmad_list_docs',
    'bmad_get_doc',
    'bmad_get_execution_log',
    'bmad_write_execution_entry',
    'bmad_get_project_status',
    'bmad_get_sprint_status',
    'bmad_list_stories',
    'bmad_get_story',
    'bmad_get_artifact_inventory',
    'bmad_list_elicitation_methods',
    'bmad_recover_execution',
  ];

  it('registers all expected tool names', () => {
    const names = toolCalls.map((t) => t.name);
    for (const expected of expectedTools) {
      expect(names).toContain(expected);
    }
  });

  it('all tools have destructiveHint: false', () => {
    for (const tool of toolCalls) {
      expect(tool.annotations.destructiveHint).toBe(false);
    }
  });

  it('all tools have openWorldHint: false', () => {
    for (const tool of toolCalls) {
      expect(tool.annotations.openWorldHint).toBe(false);
    }
  });

  it('read-only tools have readOnlyHint: true and idempotentHint: true', () => {
    const writeTools = ['bmad_write_execution_entry', 'bmad_recover_execution'];
    for (const tool of toolCalls) {
      if (!writeTools.includes(tool.name)) {
        expect(tool.annotations.readOnlyHint, `${tool.name} readOnlyHint`).toBe(true);
        expect(tool.annotations.idempotentHint, `${tool.name} idempotentHint`).toBe(true);
      }
    }
  });

  it('write tools have readOnlyHint: false and idempotentHint: false', () => {
    const writeToolNames = ['bmad_write_execution_entry', 'bmad_recover_execution'];
    for (const name of writeToolNames) {
      const tool = toolCalls.find((t) => t.name === name);
      expect(tool, `${name} should exist`).toBeDefined();
      expect(tool!.annotations.readOnlyHint, `${name} readOnlyHint`).toBe(false);
      expect(tool!.annotations.idempotentHint, `${name} idempotentHint`).toBe(false);
    }
  });

  it('all tools have non-empty descriptions', () => {
    for (const tool of toolCalls) {
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });
});
