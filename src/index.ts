#!/usr/bin/env node
import { startStdio } from './transport/stdio.js';
import { startHttp } from './transport/http.js';

const transport = process.env.BMAD_TRANSPORT || 'stdio';
const rawPort = parseInt(process.env.BMAD_HTTP_PORT || '3000', 10);
const port = Number.isNaN(rawPort) ? 3000 : rawPort;

async function main(): Promise<void> {
  if (transport === 'http') {
    await startHttp(port);
  } else {
    await startStdio();
  }
}

main().catch((error) => {
  // Use console.error directly — logger may not be initialized yet
  console.error('[bmad-mcp] [emergency] Fatal error:', error);
  process.exit(1);
});
