import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { log, logger, bindServer } from '../../src/utils/logger.js';

describe('logger', () => {
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Reset server binding
    bindServer(null as any);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
  });

  it('writes to stderr with prefix and level', () => {
    log('info', 'test message');
    expect(stderrSpy).toHaveBeenCalledWith('[bmad-mcp] [info]', 'test message');
  });

  it('writes to stderr with data as string', () => {
    log('warning', 'something happened', 'extra-detail');
    expect(stderrSpy).toHaveBeenCalledWith('[bmad-mcp] [warning]', 'something happened', 'extra-detail');
  });

  it('writes to stderr with data as object (JSON stringified)', () => {
    log('error', 'failed', { code: 42 });
    expect(stderrSpy).toHaveBeenCalledWith('[bmad-mcp] [error]', 'failed', '{"code":42}');
  });

  it('logger.debug uses debug level', () => {
    logger.debug('debug msg');
    expect(stderrSpy).toHaveBeenCalledWith('[bmad-mcp] [debug]', 'debug msg');
  });

  it('logger.info uses info level', () => {
    logger.info('info msg');
    expect(stderrSpy).toHaveBeenCalledWith('[bmad-mcp] [info]', 'info msg');
  });

  it('logger.warn uses warning level', () => {
    logger.warn('warn msg');
    expect(stderrSpy).toHaveBeenCalledWith('[bmad-mcp] [warning]', 'warn msg');
  });

  it('logger.error uses error level', () => {
    logger.error('error msg');
    expect(stderrSpy).toHaveBeenCalledWith('[bmad-mcp] [error]', 'error msg');
  });

  it('sends MCP logging notification when server is bound and connected', () => {
    const mockServer = {
      isConnected: () => true,
      sendLoggingMessage: vi.fn().mockResolvedValue(undefined),
    };
    bindServer(mockServer as any);

    log('info', 'connected msg');

    expect(mockServer.sendLoggingMessage).toHaveBeenCalledWith({
      level: 'info',
      logger: 'bmad-mcp',
      data: 'connected msg',
    });
  });

  it('does not send MCP notification when server is not connected', () => {
    const mockServer = {
      isConnected: () => false,
      sendLoggingMessage: vi.fn(),
    };
    bindServer(mockServer as any);

    log('info', 'disconnected msg');

    expect(mockServer.sendLoggingMessage).not.toHaveBeenCalled();
  });

  it('does not throw when MCP send fails', () => {
    const mockServer = {
      isConnected: () => true,
      sendLoggingMessage: vi.fn().mockRejectedValue(new Error('disconnected')),
    };
    bindServer(mockServer as any);

    expect(() => log('info', 'msg')).not.toThrow();
  });
});
