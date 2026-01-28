import fs from 'fs';
import path from 'path';
import type { FileNode, ImportGraph, ImportEdge } from '../shared/types.js';

// Simple regex patterns for common import styles
const IMPORT_PATTERNS = [
  // ES6: import x from './file'
  /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g,
  // CommonJS: require('./file')
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  // CSS: @import './file'
  /@import\s+['"]([^'"]+)['"]/g,
  // Python: from x import y, import x
  /^(?:from|import)\s+([^\s;]+)/gm,
];

// File extensions to check
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.scss', '.py'];

function extractImports(content: string, fileExtension: string): string[] {
  const imports: string[] = [];

  // Choose patterns based on file type
  let patterns = IMPORT_PATTERNS;
  if (fileExtension === '.py') {
    patterns = [IMPORT_PATTERNS[3]];
  } else if (fileExtension === '.css' || fileExtension === '.scss') {
    patterns = [IMPORT_PATTERNS[2]];
  } else {
    patterns = [IMPORT_PATTERNS[0], IMPORT_PATTERNS[1]];
  }

  for (const pattern of patterns) {
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        imports.push(match[1]);
      }
    }
  }

  return imports;
}

function resolveImportPath(
  importPath: string,
  fromFile: string,
  projectDir: string,
  allFiles: string[]
): string | null {
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }

  const fromDir = path.dirname(path.join(projectDir, fromFile));
  let resolved = path.resolve(fromDir, importPath);
  let relativePath = path.relative(projectDir, resolved);

  // Try with different extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.scss', '/index.ts', '/index.tsx', '/index.js'];

  for (const ext of extensions) {
    const tryPath = relativePath + ext;
    if (allFiles.includes(tryPath)) {
      return tryPath;
    }
  }

  return null;
}

export function parseImports(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    return extractImports(content, ext);
  } catch {
    return [];
  }
}

export function buildImportGraph(files: FileNode[], projectDir: string): ImportGraph {
  const edges: ImportEdge[] = [];
  const allFilePaths = files.map((f) => f.path);

  for (const file of files) {
    const ext = path.extname(file.path);
    if (!CODE_EXTENSIONS.includes(ext)) {
      continue;
    }

    const fullPath = path.join(projectDir, file.path);
    const imports = parseImports(fullPath);

    for (const imp of imports) {
      const resolved = resolveImportPath(imp, file.path, projectDir, allFilePaths);
      if (resolved && resolved !== file.path) {
        edges.push({
          from: file.path,
          to: resolved,
        });
      }
    }
  }

  return { type: 'import:graph', edges };
}
