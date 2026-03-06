import { describe, it, expect } from 'vitest';
import { BmadConfigSchema, SkillLevelSchema, TransportSchema } from '../../src/config/schema.js';

describe('BmadConfigSchema', () => {
  it('applies all defaults when given empty input', () => {
    const result = BmadConfigSchema.parse({});
    expect(result.project_name).toBe('MyProject');
    expect(result.user_name).toBe('BMad');
    expect(result.communication_language).toBe('English');
    expect(result.document_output_language).toBe('English');
    expect(result.user_skill_level).toBe('intermediate');
    expect(result.output_folder).toBe('{project-root}/_bmad-output');
    expect(result.transport).toBe('stdio');
    expect(result.http_port).toBe(3000);
  });

  it('accepts valid overrides', () => {
    const result = BmadConfigSchema.parse({
      project_name: 'CustomProject',
      user_name: 'Alice',
      user_skill_level: 'expert',
      transport: 'http',
      http_port: 8080,
    });
    expect(result.project_name).toBe('CustomProject');
    expect(result.user_name).toBe('Alice');
    expect(result.user_skill_level).toBe('expert');
    expect(result.transport).toBe('http');
    expect(result.http_port).toBe(8080);
  });

  it('rejects invalid skill levels', () => {
    expect(() => BmadConfigSchema.parse({ user_skill_level: 'guru' })).toThrow();
  });

  it('rejects invalid transport', () => {
    expect(() => BmadConfigSchema.parse({ transport: 'grpc' })).toThrow();
  });

  it('rejects invalid port numbers', () => {
    expect(() => BmadConfigSchema.parse({ http_port: 0 })).toThrow();
    expect(() => BmadConfigSchema.parse({ http_port: 70000 })).toThrow();
    expect(() => BmadConfigSchema.parse({ http_port: -1 })).toThrow();
  });

  it('accepts edge port values', () => {
    expect(BmadConfigSchema.parse({ http_port: 1 }).http_port).toBe(1);
    expect(BmadConfigSchema.parse({ http_port: 65535 }).http_port).toBe(65535);
  });
});

describe('SkillLevelSchema', () => {
  it('accepts valid skill levels', () => {
    expect(SkillLevelSchema.parse('beginner')).toBe('beginner');
    expect(SkillLevelSchema.parse('intermediate')).toBe('intermediate');
    expect(SkillLevelSchema.parse('expert')).toBe('expert');
  });
});

describe('TransportSchema', () => {
  it('accepts valid transports', () => {
    expect(TransportSchema.parse('stdio')).toBe('stdio');
    expect(TransportSchema.parse('http')).toBe('http');
  });
});
