import { z } from 'zod';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';

export const GetProtocolInputSchema = z.object({
  protocol_name: z.string().describe('Protocol name (e.g., "execution-logging-protocol", "ELP")'),
});

export type GetProtocolInput = z.infer<typeof GetProtocolInputSchema>;

export function getProtocol(
  registry: ContentRegistry,
  reader: ContentReader,
  input: GetProtocolInput,
): string | null {
  const protocols = registry.getByType('protocol');
  const name = input.protocol_name.toLowerCase();

  let match = protocols.find((p) => {
    const fileName = p.relativePath.split('/').pop()?.replace(/\.(md|xml|yaml)$/, '') || '';
    return fileName.toLowerCase() === name || fileName.toLowerCase().includes(name);
  });

  if (!match) {
    // Try abbreviation match (e.g., "ELP" → "execution-logging-protocol")
    match = protocols.find((p) => {
      const fileName = p.relativePath.split('/').pop()?.replace(/\.(md|xml|yaml)$/, '') || '';
      const initials = fileName
        .split('-')
        .map((w) => w[0])
        .join('')
        .toLowerCase();
      return initials === name.toLowerCase();
    });
  }

  if (!match) return null;
  return reader.readAbsolute(match.absolutePath);
}
