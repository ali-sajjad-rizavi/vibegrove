import fs from 'fs';
import path from 'path';
import type { FileNode } from '../shared/types.js';

// Directories to ignore when scanning
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.next',
  '.cache',
  'coverage',
  '__pycache__',
  '.venv',
  'venv',
  '.idea',
  '.vscode',
]);

// File extensions to include
const INCLUDED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.txt',
  '.css', '.scss', '.sass', '.less',
  '.html', '.htm',
  '.py', '.rb', '.go', '.rs', '.java',
  '.yaml', '.yml', '.toml',
  '.sh', '.bash', '.zsh',
  '.sql',
  '.graphql', '.gql',
  '.vue', '.svelte',
]);

function getFileType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const typeMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    '.json': 'json',
    '.md': 'markdown',
    '.txt': 'text',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.html': 'html',
    '.htm': 'html',
    '.py': 'python',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.java': 'java',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.sh': 'shell',
    '.bash': 'shell',
    '.zsh': 'shell',
    '.sql': 'sql',
    '.graphql': 'graphql',
    '.gql': 'graphql',
    '.vue': 'vue',
    '.svelte': 'svelte',
  };
  return typeMap[ext] || 'unknown';
}

export async function scanDirectory(dir: string, maxDepth = 5): Promise<FileNode[]> {
  const files: FileNode[] = [];

  async function scan(currentDir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(dir, fullPath);

        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
            await scan(fullPath, depth + 1);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          // Include files with known extensions or no extension
          if (INCLUDED_EXTENSIONS.has(ext) || (!ext && !entry.name.startsWith('.'))) {
            try {
              const stat = fs.statSync(fullPath);
              files.push({
                path: relativePath,
                name: entry.name,
                type: getFileType(fullPath),
                lastModified: stat.mtimeMs,
              });
            } catch {
              // Skip files we can't stat
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentDir}:`, error);
    }
  }

  await scan(dir, 0);
  return files;
}

export async function getFileContent(filePath: string): Promise<string> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Limit content size to prevent huge files from causing issues
    const MAX_SIZE = 100000; // 100KB
    if (content.length > MAX_SIZE) {
      return content.slice(0, MAX_SIZE) + '\n\n... (truncated)';
    }
    return content;
  } catch (error) {
    return `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
