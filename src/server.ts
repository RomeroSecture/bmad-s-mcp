import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ContentRegistry } from './content/registry.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';

export function createServer(): { server: McpServer; registry: ContentRegistry } {
  const registry = new ContentRegistry();

  const server = new McpServer({
    name: 'bmad-mcp',
    version: '1.0.0',
  });

  registerTools(server, registry);
  registerResources(server, registry);

  console.error(`[bmad-mcp] Indexed ${registry.size} content files`);

  return { server, registry };
}
