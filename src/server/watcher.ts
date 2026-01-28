import chokidar from 'chokidar';
import path from 'path';
import type { FileCreated, FileModified, FileDeleted } from '../shared/types.js';

type FileEvent = FileCreated | FileModified | FileDeleted;

// Files and directories to ignore
const IGNORED_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/.next/**',
  '**/.cache/**',
  '**/coverage/**',
  '**/*.log',
  '**/.DS_Store',
];

export function createWatcher(
  projectDir: string,
  onEvent: (event: FileEvent) => void
): chokidar.FSWatcher {
  const watcher = chokidar.watch(projectDir, {
    ignored: IGNORED_PATTERNS,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100,
    },
  });

  watcher.on('add', (filePath) => {
    const relativePath = path.relative(projectDir, filePath);
    onEvent({
      type: 'file:created',
      path: relativePath,
      timestamp: Date.now(),
    });
  });

  watcher.on('change', (filePath) => {
    const relativePath = path.relative(projectDir, filePath);
    onEvent({
      type: 'file:modified',
      path: relativePath,
      timestamp: Date.now(),
    });
  });

  watcher.on('unlink', (filePath) => {
    const relativePath = path.relative(projectDir, filePath);
    onEvent({
      type: 'file:deleted',
      path: relativePath,
      timestamp: Date.now(),
    });
  });

  watcher.on('error', (error) => {
    console.error('Watcher error:', error);
  });

  return watcher;
}
