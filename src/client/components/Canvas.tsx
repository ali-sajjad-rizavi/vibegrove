import { useMemo } from 'react';
import { FileNode as FileNodeComponent } from './FileNode';
import type { FileNode, ImportEdge } from '@shared/types';
import { theme } from '../styles/theme';

interface CanvasProps {
  files: FileNode[];
  importEdges: ImportEdge[];
  zoom: number;
  pan: { x: number; y: number };
  selectedFile: FileNode | null;
  pulsingFiles: Set<string>;
  newFiles: Set<string>;
  onFileSelect: (file: FileNode) => void;
}

// Simple layout algorithm to position files in a grid-like pattern
function calculateFilePositions(files: FileNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Group files by directory
  const directories = new Map<string, FileNode[]>();
  files.forEach((file) => {
    const dir = file.path.split('/').slice(0, -1).join('/') || '/';
    if (!directories.has(dir)) {
      directories.set(dir, []);
    }
    directories.get(dir)!.push(file);
  });

  // Position files in clusters by directory
  let clusterY = 100;
  const spacing = { x: 200, y: 120 };
  const filesPerRow = 4;

  directories.forEach((dirFiles) => {
    dirFiles.forEach((file, index) => {
      const row = Math.floor(index / filesPerRow);
      const col = index % filesPerRow;
      positions.set(file.path, {
        x: 100 + col * spacing.x + (row % 2) * 50, // Offset alternating rows
        y: clusterY + row * spacing.y,
      });
    });
    clusterY += Math.ceil(dirFiles.length / filesPerRow) * spacing.y + 60;
  });

  return positions;
}

export function Canvas({
  files,
  importEdges,
  zoom,
  pan,
  selectedFile,
  pulsingFiles,
  newFiles,
  onFileSelect,
}: CanvasProps) {
  const filePositions = useMemo(() => calculateFilePositions(files), [files]);

  // Calculate edge lines between files
  const edgeLines = useMemo(() => {
    return importEdges
      .map((edge) => {
        const fromPos = filePositions.get(edge.from);
        const toPos = filePositions.get(edge.to);
        if (!fromPos || !toPos) return null;

        // Calculate line from center bottom of "from" to center top of "to"
        const fromX = fromPos.x + 70; // Approximate center of node
        const fromY = fromPos.y + 50;
        const toX = toPos.x + 70;
        const toY = toPos.y;

        return { fromX, fromY, toX, toY, key: `${edge.from}-${edge.to}` };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);
  }, [importEdges, filePositions]);

  return (
    <>
      {/* Background pattern */}
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        data-canvas="true"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1" fill={theme.colors.border} opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Transformed canvas content */}
      <div
        data-canvas="true"
        style={{
          position: 'absolute',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: 'transform 0.05s ease-out',
        }}
      >
        {/* Connection lines (SVG layer) */}
        <svg
          style={{
            position: 'absolute',
            width: '2000px',
            height: '2000px',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {edgeLines.map((line) => (
            <g key={line.key}>
              {/* Connection line */}
              <line
                x1={line.fromX}
                y1={line.fromY}
                x2={line.toX}
                y2={line.toY}
                stroke={theme.colors.accent}
                strokeWidth="2"
                strokeDasharray="6 3"
                opacity="0.5"
              />
              {/* Arrow at the end */}
              <polygon
                points={`${line.toX},${line.toY} ${line.toX - 5},${line.toY - 10} ${line.toX + 5},${line.toY - 10}`}
                fill={theme.colors.accent}
                opacity="0.6"
              />
            </g>
          ))}
        </svg>

        {/* File nodes */}
        {files.map((file) => {
          const position = filePositions.get(file.path);
          if (!position) return null;

          return (
            <FileNodeComponent
              key={file.path}
              file={file}
              position={position}
              isSelected={selectedFile?.path === file.path}
              isPulsing={pulsingFiles.has(file.path)}
              isNew={newFiles.has(file.path)}
              onClick={() => onFileSelect(file)}
            />
          );
        })}
      </div>
    </>
  );
}
