import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { listWorkflows } from '../tools/list-workflows.js';
import { listAgents } from '../tools/list-agents.js';
import { getConfig } from '../tools/get-config.js';

export function registerResources(server: McpServer, registry: ContentRegistry): void {
  const reader = new ContentReader(registry);

  // bmad://config — Resolved configuration
  server.resource(
    'config',
    'bmad://config',
    { description: 'Current resolved BMAD configuration' },
    async () => {
      const config = getConfig({});
      return {
        contents: [{ uri: 'bmad://config', mimeType: 'text/yaml', text: config }],
      };
    },
  );

  // bmad://catalog/workflows — Combined workflow catalog
  server.resource(
    'workflow-catalog',
    'bmad://catalog/workflows',
    { description: 'Complete catalog of all BMAD workflows from module-help.csv' },
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
  server.resource(
    'agent-roster',
    'bmad://catalog/agents',
    { description: 'Roster of all BMAD agents with metadata' },
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
  server.resource(
    'method-overview',
    'bmad://docs/overview',
    { description: 'Overview of the BMAD-S Method (Secture edition)' },
    async () => {
      // Try to serve the real bmad-overview.md from docs
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

      // Fallback: generate from catalogs
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
  server.resource(
    'workflow-engine',
    'bmad://core/workflow-engine',
    { description: 'The workflow.xml engine for executing YAML-based BMAD workflows' },
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
}
