import { useState, useMemo, useEffect } from 'react';
import type { FileNode } from '@shared/types';
import { theme } from '../styles/theme';
import { FileIcon, FolderIcon } from './FileIcon';

interface DirectorySidebarProps {
  files: FileNode[];
  selectedFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  file?: FileNode;
}

// Build a tree structure from flat file list
function buildFileTree(files: FileNode[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let existing = currentLevel.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isDirectory: !isLast,
          children: [],
          file: isLast ? file : undefined,
        };
        currentLevel.push(existing);
      }

      if (!isLast) {
        currentLevel = existing.children;
      }
    }
  }

  // Sort: directories first, then alphabetically
  function sortTree(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((node) => ({
        ...node,
        children: sortTree(node.children),
      }));
  }

  return sortTree(root);
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (file: FileNode) => void;
}

function TreeItem({ node, depth, selectedPath, expandedPaths, onToggle, onSelect }: TreeItemProps) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (node.isDirectory) {
      onToggle(node.path);
    } else if (node.file) {
      onSelect(node.file);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 10px',
          paddingLeft: `${12 + depth * 16}px`,
          cursor: 'pointer',
          background: isSelected ? theme.colors.accentLight + '40' : 'transparent',
          borderRadius: theme.radius.sm,
          margin: '1px 6px',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLElement).style.background = theme.colors.bgWarm;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }
        }}
      >
        {/* Expand/collapse icon for directories */}
        <span
          style={{
            width: '16px',
            fontSize: '10px',
            color: theme.colors.textMuted,
            flexShrink: 0,
          }}
        >
          {node.isDirectory ? (isExpanded ? '▼' : '▶') : ''}
        </span>

        {/* Folder/file icon */}
        <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
          {node.isDirectory ? (
            <FolderIcon isOpen={isExpanded} size={16} />
          ) : (
            <FileIcon filename={node.name} size={16} />
          )}
        </span>

        {/* Name */}
        <span
          style={{
            fontSize: '12px',
            color: isSelected ? theme.colors.accentDark : theme.colors.text,
            fontWeight: isSelected ? 500 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {node.name}
        </span>
      </div>

      {/* Children */}
      {node.isDirectory && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function DirectorySidebar({ files, selectedFile, onFileSelect }: DirectorySidebarProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    // Start with top-level directories expanded
    const initial = new Set<string>();
    files.forEach((f) => {
      const firstDir = f.path.split('/')[0];
      if (firstDir && f.path.includes('/')) {
        initial.add(firstDir);
      }
    });
    return initial;
  });

  const tree = useMemo(() => buildFileTree(files), [files]);

  // Auto-expand parent directories when a file is selected from the canvas
  useEffect(() => {
    if (selectedFile) {
      const parts = selectedFile.path.split('/');
      if (parts.length > 1) {
        // Get all parent directory paths
        const parentPaths: string[] = [];
        for (let i = 1; i < parts.length; i++) {
          parentPaths.push(parts.slice(0, i).join('/'));
        }
        // Expand all parents
        setExpandedPaths((prev) => {
          const next = new Set(prev);
          parentPaths.forEach((p) => next.add(p));
          return next;
        });
      }
    }
  }, [selectedFile]);

  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: '16px',
        top: '100px',
        width: '240px',
        maxHeight: 'calc(100vh - 200px)',
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.md,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Tree */}
      <div
        style={{
          overflow: 'auto',
          padding: '12px 0',
        }}
      >
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedFile?.path ?? null}
            expandedPaths={expandedPaths}
            onToggle={handleToggle}
            onSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
