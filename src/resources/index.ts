import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { listWorkflows } from '../tools/list-workflows.js';
import { listAgents } from '../tools/list-agents.js';
import { getAgent } from '../tools/get-agent.js';
import { getConfig } from '../tools/get-config.js';
import { getDoc } from '../tools/get-doc.js';
import { getWorkflow } from '../tools/get-workflow.js';

export function registerResources(server: McpServer, registry: ContentRegistry): void {
  const reader = new ContentReader(registry);

  // ===== Static Resources =====

  // bmad://config — Resolved configuration
  server.registerResource(
    'config',
    'bmad://config',
    { title: 'BMAD Config', description: 'Current resolved BMAD configuration' },
    async () => {
      const config = getConfig({});
      return {
        contents: [{ uri: 'bmad://config', mimeType: 'text/yaml', text: config }],
      };
    },
  );

  // bmad://catalog/workflows — Combined workflow catalog
  server.registerResource(
    'workflow-catalog',
    'bmad://catalog/workflows',
    { title: 'Workflow Catalog', description: 'Complete catalog of all BMAD workflows from module-help.csv' },
    async () => {
      const workflows = listWorkflows(registry, reader, {});
      return {
        contents: [{
          uri: 'bmad://catalog/workflows',
          mimeType: 'application/json',
          text: JSON.stringify(workflows, null, 2),
        }],
      };
    },
  );

  // bmad://catalog/agents — Agent roster
  server.registerResource(
    'agent-roster',
    'bmad://catalog/agents',
    { title: 'Agent Roster', description: 'Roster of all BMAD agents with metadata' },
    async () => {
      const agents = listAgents(registry, reader, { module: 'all' });
      return {
        contents: [{
          uri: 'bmad://catalog/agents',
          mimeType: 'application/json',
          text: JSON.stringify(agents, null, 2),
        }],
      };
    },
  );

  // bmad://docs/overview — Method overview (from real BMAD-S documentation)
  server.registerResource(
    'method-overview',
    'bmad://docs/overview',
    { title: 'Method Overview', description: 'Overview of the BMAD-S Method (Secture edition)' },
    async () => {
      const overview = reader.readFromContent('docs', 'bmad-overview.md');
      if (overview) {
        return {
          contents: [{
            uri: 'bmad://docs/overview',
            mimeType: 'text/markdown',
            text: overview,
          }],
        };
      }

      const workflows = listWorkflows(registry, reader, {});
      const agents = listAgents(registry, reader, { module: 'all' });

      const fallback = [
        '# BMAD-S Method Overview',
        '',
        'The **B**reakthrough **M**ethod of **A**gile AI-driven **D**evelopment — **S**ecture edition (BMAD-S)',
        'is a comprehensive framework for AI-assisted software development.',
        '',
        '## Agents',
        ...agents.map((a) => `- ${a.icon} **${a.name}** (${a.title}) — ${a.role}`),
        '',
        '## Workflows',
        ...workflows.map((w) => `- **${w.name}** [${w.code}] (${w.phase}) — ${w.description}`),
        '',
        '## Documentation',
        '',
        'Use `bmad_list_docs` to browse available methodology documentation.',
        'Use `bmad_get_doc` with a topic to read specific guides.',
      ].join('\n');

      return {
        contents: [{
          uri: 'bmad://docs/overview',
          mimeType: 'text/markdown',
          text: fallback,
        }],
      };
    },
  );

  // bmad://core/workflow-engine — workflow.xml
  server.registerResource(
    'workflow-engine',
    'bmad://core/workflow-engine',
    { title: 'Workflow Engine', description: 'The workflow.xml engine for executing YAML-based BMAD workflows' },
    async () => {
      const content = reader.readFromContent('core', 'tasks', 'workflow.xml');
      return {
        contents: [{
          uri: 'bmad://core/workflow-engine',
          mimeType: 'application/xml',
          text: content || 'workflow.xml not found',
        }],
      };
    },
  );

  // ===== Resource Templates (dynamic) =====

  // bmad://agent/{agentId} — Agent definition by ID
  server.registerResource(
    'agent-by-id',
    new ResourceTemplate('bmad://agent/{agentId}', {
      list: async () => {
        const agents = listAgents(registry, reader, { module: 'all' });
        return {
          resources: agents.map((a) => {
            const id = a.id.split('/').pop()?.replace('.agent.yaml', '') || a.name.toLowerCase();
            return {
              uri: `bmad://agent/${id}`,
              name: `${a.icon} ${a.name} (${a.title})`,
              description: a.role,
              mimeType: 'text/yaml',
            };
          }),
        };
      },
      complete: {
        agentId: async (value) => {
          const agents = listAgents(registry, reader, { module: 'all' });
          const ids = agents.map(
            (a) => a.id.split('/').pop()?.replace('.agent.yaml', '') || a.name.toLowerCase(),
          );
          return ids.filter((id) => id.includes(value.toLowerCase()));
        },
      },
    }),
    { title: 'Agent by ID', description: 'Full YAML definition of a BMAD-S agent' },
    async (uri, { agentId }) => {
      const content = getAgent(registry, reader, { agent_id: agentId as string });
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/yaml',
          text: content || `Agent not found: ${agentId}`,
        }],
      };
    },
  );

  // bmad://workflow/{workflowCode} — Workflow by trigger code
  server.registerResource(
    'workflow-by-code',
    new ResourceTemplate('bmad://workflow/{workflowCode}', {
      list: async () => {
        const workflows = listWorkflows(registry, reader, {});
        return {
          resources: workflows.map((w) => ({
            uri: `bmad://workflow/${w.code}`,
            name: `${w.name} [${w.code}]`,
            description: w.description,
            mimeType: 'text/markdown',
          })),
        };
      },
      complete: {
        workflowCode: async (value) => {
          const workflows = listWorkflows(registry, reader, {});
          return workflows
            .map((w) => w.code)
            .filter((c) => c.toLowerCase().startsWith(value.toLowerCase()));
        },
      },
    }),
    { title: 'Workflow by Code', description: 'BMAD-S workflow content by trigger code' },
    async (uri, { workflowCode }) => {
      const result = getWorkflow(registry, reader, { workflow_code: workflowCode as string });
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/markdown',
          text: result?.content || `Workflow not found: ${workflowCode}`,
        }],
      };
    },
  );

  // bmad://doc/{topic} — Documentation by topic
  server.registerResource(
    'doc-by-topic',
    new ResourceTemplate('bmad://doc/{topic}', {
      list: async () => {
        const docs = registry.getByType('doc');
        return {
          resources: docs.map((d) => {
            const topic = d.relativePath
              .replace('docs/', '')
              .replace(/\.[^.]+$/, '')
              .replace(/\//g, '-');
            return {
              uri: `bmad://doc/${topic}`,
              name: topic,
              mimeType: 'text/markdown',
            };
          }),
        };
      },
      complete: {
        topic: async (value) => {
          const docs = registry.getByType('doc');
          const topics = docs.map((d) =>
            d.relativePath.replace('docs/', '').replace(/\.[^.]+$/, '').replace(/\//g, '-'),
          );
          return topics.filter((t) => t.toLowerCase().includes(value.toLowerCase()));
        },
      },
    }),
    { title: 'Doc by Topic', description: 'BMAD-S methodology documentation by topic' },
    async (uri, { topic }) => {
      const content = getDoc(registry, reader, { topic: topic as string });
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/markdown',
          text: content || `Documentation not found: ${topic}`,
        }],
      };
    },
  );
}
