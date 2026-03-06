import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests that all 17 tools are registered with READ_ONLY annotations.
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

  it('registers exactly 17 tools', () => {
    expect(toolCalls).toHaveLength(17);
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
  ];

  it('registers all expected tool names', () => {
    const names = toolCalls.map((t) => t.name);
    for (const expected of expectedTools) {
      expect(names).toContain(expected);
    }
  });

  it('all tools have readOnlyHint: true', () => {
    for (const tool of toolCalls) {
      expect(tool.annotations.readOnlyHint).toBe(true);
    }
  });

  it('all tools have destructiveHint: false', () => {
    for (const tool of toolCalls) {
      expect(tool.annotations.destructiveHint).toBe(false);
    }
  });

  it('all tools have idempotentHint: true', () => {
    for (const tool of toolCalls) {
      expect(tool.annotations.idempotentHint).toBe(true);
    }
  });

  it('all tools have openWorldHint: false', () => {
    for (const tool of toolCalls) {
      expect(tool.annotations.openWorldHint).toBe(false);
    }
  });

  it('all tools have non-empty descriptions', () => {
    for (const tool of toolCalls) {
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });
});
