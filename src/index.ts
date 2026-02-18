#!/usr/bin/env node
import { startStdio } from './transport/stdio.js';
import { startHttp } from './transport/http.js';

const transport = process.env.BMAD_TRANSPORT || 'stdio';
const port = parseInt(process.env.BMAD_HTTP_PORT || '3000', 10);

async function main(): Promise<void> {
  if (transport === 'http') {
    await startHttp(port);
  } else {
    await startStdio();
  }
}

main().catch((error) => {
  console.error('[bmad-mcp] Fatal error:', error);
  process.exit(1);
});
