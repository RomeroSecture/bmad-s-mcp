import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MCP Resources', () => {
  const resourceCalls: Array<{
    name: string;
    uri: string | object;
    metadata: Record<string, unknown>;
    handler: (...args: unknown[]) => unknown;
  }> = [];

  beforeEach(async () => {
    resourceCalls.length = 0;

    const mockServer = {
      registerResource: vi.fn((...args: unknown[]) => {
        // server.registerResource(name, uri/template, metadata, handler)
        resourceCalls.push({
          name: args[0] as string,
          uri: args[1] as string | object,
          metadata: args[2] as Record<string, unknown>,
          handler: args[3] as (...a: unknown[]) => unknown,
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

    const { registerResources } = await import('../../src/resources/index.js');
    registerResources(mockServer as any, mockRegistry as any);
  });

  it('registers exactly 10 resources (7 static + 3 templates)', () => {
    expect(resourceCalls).toHaveLength(10);
  });

  describe('Static Resources', () => {
    it('registers config resource with bmad://config URI', () => {
      const res = resourceCalls.find((r) => r.name === 'config');
      expect(res).toBeDefined();
      expect(res!.uri).toBe('bmad://config');
    });

    it('registers workflow-catalog resource', () => {
      const res = resourceCalls.find((r) => r.name === 'workflow-catalog');
      expect(res).toBeDefined();
      expect(res!.uri).toBe('bmad://catalog/workflows');
    });

    it('registers agent-roster resource', () => {
      const res = resourceCalls.find((r) => r.name === 'agent-roster');
      expect(res).toBeDefined();
      expect(res!.uri).toBe('bmad://catalog/agents');
    });

    it('registers method-overview resource', () => {
      const res = resourceCalls.find((r) => r.name === 'method-overview');
      expect(res).toBeDefined();
      expect(res!.uri).toBe('bmad://docs/overview');
    });

    it('registers workflow-engine resource', () => {
      const res = resourceCalls.find((r) => r.name === 'workflow-engine');
      expect(res).toBeDefined();
      expect(res!.uri).toBe('bmad://core/workflow-engine');
    });

    it('registers elicitation-methods resource', () => {
      const res = resourceCalls.find((r) => r.name === 'elicitation-methods');
      expect(res).toBeDefined();
      expect(res!.uri).toBe('bmad://catalog/elicitation-methods');
    });

    it('registers teams-catalog resource', () => {
      const res = resourceCalls.find((r) => r.name === 'teams-catalog');
      expect(res).toBeDefined();
      expect(res!.uri).toBe('bmad://catalog/teams');
    });
  });

  describe('Resource Templates', () => {
    it('registers agent-by-id template with bmad://agent/{agentId}', () => {
      const res = resourceCalls.find((r) => r.name === 'agent-by-id');
      expect(res).toBeDefined();
      // Template is an object (ResourceTemplate), not a string
      expect(typeof res!.uri).toBe('object');
    });

    it('registers workflow-by-code template', () => {
      const res = resourceCalls.find((r) => r.name === 'workflow-by-code');
      expect(res).toBeDefined();
      expect(typeof res!.uri).toBe('object');
    });

    it('registers doc-by-topic template', () => {
      const res = resourceCalls.find((r) => r.name === 'doc-by-topic');
      expect(res).toBeDefined();
      expect(typeof res!.uri).toBe('object');
    });
  });

  describe('Resource metadata', () => {
    it('all resources have descriptions', () => {
      for (const res of resourceCalls) {
        expect(res.metadata.description).toBeDefined();
        expect((res.metadata.description as string).length).toBeGreaterThan(0);
      }
    });
  });
});
