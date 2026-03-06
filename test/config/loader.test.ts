import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadConfig } from '../../src/config/loader.js';

describe('loadConfig', () => {
  afterEach(() => {
    // Clean up env vars
    delete process.env.BMAD_PROJECT_NAME;
    delete process.env.BMAD_USER_NAME;
    delete process.env.BMAD_LANG;
    delete process.env.BMAD_DOC_LANG;
    delete process.env.BMAD_SKILL_LEVEL;
    delete process.env.BMAD_OUTPUT_FOLDER;
    delete process.env.BMAD_TRANSPORT;
    delete process.env.BMAD_HTTP_PORT;
  });

  it('returns defaults when no config file exists', () => {
    const config = loadConfig('/tmp/nonexistent-project');
    expect(config.project_name).toBe('nonexistent-project'); // basename of path
    expect(config.user_name).toBe('BMad');
    expect(config.communication_language).toBe('English');
    expect(config.transport).toBe('stdio');
  });

  it('derives project_name from directory basename', () => {
    const config = loadConfig('/path/to/my-awesome-app');
    expect(config.project_name).toBe('my-awesome-app');
  });

  it('env vars override defaults', () => {
    process.env.BMAD_PROJECT_NAME = 'EnvProject';
    process.env.BMAD_USER_NAME = 'EnvUser';
    process.env.BMAD_LANG = 'Spanish';
    process.env.BMAD_SKILL_LEVEL = 'expert';

    const config = loadConfig('/tmp/test');
    expect(config.project_name).toBe('EnvProject');
    expect(config.user_name).toBe('EnvUser');
    expect(config.communication_language).toBe('Spanish');
    expect(config.user_skill_level).toBe('expert');
  });

  it('parses BMAD_HTTP_PORT as integer', () => {
    process.env.BMAD_HTTP_PORT = '9090';
    const config = loadConfig('/tmp/test');
    expect(config.http_port).toBe(9090);
  });

  it('env var BMAD_TRANSPORT sets transport', () => {
    process.env.BMAD_TRANSPORT = 'http';
    const config = loadConfig('/tmp/test');
    expect(config.transport).toBe('http');
  });

  it('BMAD_OUTPUT_FOLDER is prefixed with {project-root}', () => {
    process.env.BMAD_OUTPUT_FOLDER = 'custom-output';
    const config = loadConfig('/tmp/test');
    expect(config.output_folder).toBe('{project-root}/custom-output');
  });
});
