import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from '../server.js';
import { logger } from '../utils/logger.js';

/**
 * Bearer token auth middleware.
 * If BMAD_AUTH_TOKEN is set, all requests to /mcp require a valid Bearer token.
 * Multiple tokens can be separated by commas for team use.
 */
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const tokenEnv = process.env.BMAD_AUTH_TOKEN;
  if (!tokenEnv) {
    // No token configured — open access
    next();
    return;
  }

  const validTokens = tokenEnv.split(',').map((t) => t.trim()).filter(Boolean);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Rejected request: missing Bearer token');
    res.status(401).json({ error: 'Authentication required. Set Authorization: Bearer <token>' });
    return;
  }

  const token = authHeader.slice(7);
  if (!validTokens.includes(token)) {
    logger.warn('Rejected request: invalid Bearer token');
    res.status(403).json({ error: 'Invalid token' });
    return;
  }

  next();
}

export async function startHttp(port: number): Promise<void> {
  const { server } = createServer();
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  // Health check (always public)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'bmad-mcp' });
  });

  // MCP endpoint (protected by auth if BMAD_AUTH_TOKEN is set)
  app.post('/mcp', authMiddleware, async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        transport.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      logger.error(`MCP handler error: ${err}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  const authEnabled = !!process.env.BMAD_AUTH_TOKEN;
  app.listen(port, () => {
    logger.info(`HTTP server listening on port ${port} (auth: ${authEnabled ? 'enabled' : 'open'})`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    logger.error(`Failed to start HTTP server: ${err.message}`);
    process.exit(1);
  });
}
