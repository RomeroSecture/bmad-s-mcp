import { describe, it, expect } from 'vitest';
import { createTestRegistry, createTestReader } from '../helpers.js';
import { listElicitationMethods } from '../../src/tools/list-elicitation-methods.js';

// The test registry uses fixture content which doesn't have methods.csv.
// We test with the real content registry for this tool.
import { ContentRegistry } from '../../src/content/registry.js';
import { ContentReader } from '../../src/content/reader.js';

describe('listElicitationMethods', () => {
  // Use real content directory since methods.csv is in content/
  const registry = new ContentRegistry();
  const reader = new ContentReader(registry);

  it('lists all 50 methods when no filter', () => {
    const methods = listElicitationMethods(registry, reader, {});
    expect(methods.length).toBe(50);
  });

  it('filters by category', () => {
    const methods = listElicitationMethods(registry, reader, { category: 'collaboration' });
    expect(methods.length).toBe(10);
    expect(methods.every((m) => m.category === 'collaboration')).toBe(true);
  });

  it('returns methods with all fields', () => {
    const methods = listElicitationMethods(registry, reader, { category: 'core' });
    expect(methods.length).toBeGreaterThan(0);
    const method = methods[0];
    expect(method.num).toBeDefined();
    expect(method.category).toBe('core');
    expect(method.method_name).toBeTruthy();
    expect(method.description).toBeTruthy();
    expect(method.output_pattern).toBeTruthy();
  });

  it('returns empty for non-existent category', () => {
    const methods = listElicitationMethods(registry, reader, { category: 'nonexistent' });
    expect(methods).toEqual([]);
  });

  it('returns empty when using test fixture registry (no methods.csv)', () => {
    const testRegistry = createTestRegistry();
    const testReader = createTestReader(testRegistry);
    const methods = listElicitationMethods(testRegistry, testReader, {});
    expect(methods).toEqual([]);
  });
});
