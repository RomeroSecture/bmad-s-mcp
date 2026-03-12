import { basename } from 'node:path';
import type { ProjectReader } from './project-reader.js';

export interface StoryEntry {
  id: string;
  filename: string;
  path: string;
  status?: string;
  epic?: string;
}

export class SprintReader {
  constructor(private reader: ProjectReader) {}

  getSprintStatus(): string | null {
    const implDir = this.reader.getImplDir();
    const files = this.reader.listFiles(implDir, /sprint[-_]status/i);
    if (files.length === 0) return null;

    // Return the most recent one (last in list)
    return this.reader.readFile(files[files.length - 1]);
  }

  listStories(filter?: { status?: string; epic?: string }): StoryEntry[] {
    const implDir = this.reader.getImplDir();
    const files = this.reader.listFiles(implDir, /\.(md|yaml|yml)$/);

    const stories: StoryEntry[] = [];

    for (const file of files) {
      const name = basename(file).toLowerCase();
      // Match story files: story-*.md, S001-*.md, etc.
      if (!name.includes('story') && !name.match(/^s\d+/)) continue;
      if (name.includes('sprint-status') || name.includes('sprint_status')) continue;

      const content = this.reader.readFile(file);
      const entry: StoryEntry = {
        id: this.extractStoryId(name),
        filename: basename(file),
        path: file,
        status: content ? this.extractField(content, 'status') : undefined,
        epic: content ? this.extractField(content, 'epic') : undefined,
      };

      if (filter?.status && entry.status?.toLowerCase() !== filter.status.toLowerCase()) continue;
      if (filter?.epic && entry.epic?.toLowerCase() !== filter.epic.toLowerCase()) continue;

      stories.push(entry);
    }

    return stories;
  }

  getStory(storyId: string): string | null {
    const implDir = this.reader.getImplDir();
    const files = this.reader.listFiles(implDir, /\.(md|yaml|yml)$/);

    const lower = storyId.toLowerCase();
    for (const file of files) {
      const name = basename(file).toLowerCase();
      if (name.includes(lower) || this.extractStoryId(name) === lower) {
        return this.reader.readFile(file);
      }
    }
    return null;
  }

  private extractStoryId(filename: string): string {
    // Extract ID from patterns like "S001-feature.md", "story-001.md"
    const match = filename.match(/^(s\d+)/i) || filename.match(/story[-_]?(\d+)/i);
    if (match) return match[0].toLowerCase();
    return filename.replace(/\.(md|yaml|yml)$/, '');
  }

  private extractField(content: string, field: string): string | undefined {
    // Try YAML front matter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const fieldMatch = fmMatch[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'mi'));
      if (fieldMatch) return fieldMatch[1].trim();
    }

    // Try markdown field pattern: **Status**: value or Status: value
    const mdMatch = content.match(new RegExp(`\\*?\\*?${field}\\*?\\*?:\\s*(.+)`, 'i'));
    if (mdMatch) return mdMatch[1].trim();

    return undefined;
  }
}
