import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

type LogLevel = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';

let _server: McpServer | null = null;

/** Bind the MCP server instance so logs are sent as MCP notifications */
export function bindServer(server: McpServer): void {
  _server = server;
}

/** Send a structured log via MCP protocol (+ stderr fallback) */
export function log(level: LogLevel, message: string, data?: unknown): void {
  // Always write to stderr for debugging
  const prefix = `[bmad-mcp] [${level}]`;
  if (data !== undefined) {
    console.error(prefix, message, typeof data === 'string' ? data : JSON.stringify(data));
  } else {
    console.error(prefix, message);
  }

  // Send MCP logging notification if connected
  if (_server?.isConnected()) {
    _server.sendLoggingMessage({
      level,
      logger: 'bmad-mcp',
      data: data !== undefined ? `${message} ${typeof data === 'string' ? data : JSON.stringify(data)}` : message,
    }).catch(() => {
      // Ignore send failures — server may have disconnected
    });
  }
}

export const logger = {
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
  info: (msg: string, data?: unknown) => log('info', msg, data),
  warn: (msg: string, data?: unknown) => log('warning', msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
};
