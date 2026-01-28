import type { ReactNode } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import type { FileNode } from '@shared/types';
import { theme } from '../styles/theme';

interface FilePreviewProps {
  file: FileNode;
  content: string;
  onClose: () => void;
}

// Simple syntax highlighting tokens
function highlightSyntax(content: string, _fileType: string): ReactNode {
  // For now, just return the content with basic styling
  // A full implementation would use a proper syntax highlighting library
  const lines = content.split('\n');

  return lines.map((line, i) => (
    <div key={i} style={{ display: 'flex' }}>
      <span
        style={{
          display: 'inline-block',
          width: '40px',
          color: theme.colors.textMuted,
          textAlign: 'right',
          paddingRight: '12px',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {i + 1}
      </span>
      <span style={{ whiteSpace: 'pre' }}>{line || ' '}</span>
    </div>
  ));
}

export function FilePreview({ file, content, onClose }: FilePreviewProps) {
  const { position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: {
      x: typeof window !== 'undefined' ? window.innerWidth - 380 : 500,
      y: 80,
    },
  });

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '340px',
        maxHeight: '400px',
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.accent}`,
        boxShadow: theme.shadows.lg,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: theme.colors.bgWarm,
          borderBottom: `1px solid ${theme.colors.border}`,
          cursor: isDragging ? 'grabbing' : 'grab',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: '12px',
            color: theme.colors.text,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {file.path}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: theme.colors.textMuted,
            cursor: 'pointer',
            fontSize: '16px',
            padding: '2px 6px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px 0',
        }}
      >
        {content ? (
          <pre
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '11px',
              color: theme.colors.text,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {highlightSyntax(content, file.type)}
          </pre>
        ) : (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: theme.colors.textMuted,
              fontSize: '12px',
            }}
          >
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
