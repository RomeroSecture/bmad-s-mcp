import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MCP Prompts', () => {
  const promptCalls: Array<{
    name: string;
    description: string;
    args: Record<string, unknown>;
    handler: (...args: unknown[]) => unknown;
  }> = [];

  beforeEach(async () => {
    promptCalls.length = 0;

    const mockServer = {
      registerPrompt: vi.fn((...args: unknown[]) => {
        // server.registerPrompt(name, config, handler)
        const name = args[0] as string;
        const config = args[1] as { description?: string; argsSchema?: Record<string, unknown> };
        const handler = args[2] as (...a: unknown[]) => unknown;
        promptCalls.push({
          name,
          description: config.description || '',
          args: config.argsSchema || {},
          handler,
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

    const { registerPrompts } = await import('../../src/prompts/index.js');
    registerPrompts(mockServer as any, mockRegistry as any);
  });

  it('registers exactly 5 prompts', () => {
    expect(promptCalls).toHaveLength(5);
  });

  it('registers bmad-start prompt', () => {
    const prompt = promptCalls.find((p) => p.name === 'bmad-start');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('Start');
    expect(prompt!.args).toHaveProperty('mode');
  });

  it('registers bmad-agent prompt', () => {
    const prompt = promptCalls.find((p) => p.name === 'bmad-agent');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('agent');
    expect(prompt!.args).toHaveProperty('agent');
  });

  it('registers bmad-workflow prompt', () => {
    const prompt = promptCalls.find((p) => p.name === 'bmad-workflow');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('workflow');
    expect(prompt!.args).toHaveProperty('code');
  });

  it('registers bmad-status prompt', () => {
    const prompt = promptCalls.find((p) => p.name === 'bmad-status');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('status');
  });

  it('registers bmad-help prompt', () => {
    const prompt = promptCalls.find((p) => p.name === 'bmad-help');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('methodology');
    expect(prompt!.args).toHaveProperty('topic');
  });

  describe('prompt handlers', () => {
    it('bmad-start handler returns messages with SO trigger for new projects', () => {
      const prompt = promptCalls.find((p) => p.name === 'bmad-start')!;
      const result = prompt.handler({ mode: 'new' }) as any;
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content.text).toContain('SO');
      expect(result.messages[0].content.text).toContain('new project');
    });

    it('bmad-start handler returns IP trigger for existing projects', () => {
      const prompt = promptCalls.find((p) => p.name === 'bmad-start')!;
      const result = prompt.handler({ mode: 'existing' }) as any;
      expect(result.messages[0].content.text).toContain('IP');
      expect(result.messages[0].content.text).toContain('import');
    });

    it('bmad-agent handler includes agent name', () => {
      const prompt = promptCalls.find((p) => p.name === 'bmad-agent')!;
      const result = prompt.handler({ agent: 'lisa' }) as any;
      expect(result.messages[0].content.text).toContain('lisa');
      expect(result.messages[0].content.text).toContain('bmad_get_agent');
    });

    it('bmad-workflow handler includes workflow code', () => {
      const prompt = promptCalls.find((p) => p.name === 'bmad-workflow')!;
      const result = prompt.handler({ code: 'CP' }) as any;
      expect(result.messages[0].content.text).toContain('CP');
      expect(result.messages[0].content.text).toContain('bmad_get_workflow');
    });

    it('bmad-status handler requests project status', () => {
      const prompt = promptCalls.find((p) => p.name === 'bmad-status')!;
      const result = prompt.handler({}) as any;
      expect(result.messages[0].content.text).toContain('status');
      expect(result.messages[0].content.text).toContain('bmad_help');
    });

    it('bmad-help handler includes topic when provided', () => {
      const prompt = promptCalls.find((p) => p.name === 'bmad-help')!;
      const result = prompt.handler({ topic: 'vrg' }) as any;
      expect(result.messages[0].content.text).toContain('vrg');
      expect(result.messages[0].content.text).toContain('bmad_get_doc');
    });
  });
});
