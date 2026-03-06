import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from '../server.js';
import { logger } from '../utils/logger.js';

export async function startStdio(): Promise<void> {
  const { server } = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Running on stdio transport');
}
