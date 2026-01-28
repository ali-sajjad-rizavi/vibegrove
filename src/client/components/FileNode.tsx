import type { FileNode as FileNodeType } from '@shared/types';
import { theme } from '../styles/theme';

interface FileNodeProps {
  file: FileNodeType;
  position: { x: number; y: number };
  isSelected: boolean;
  isPulsing: boolean;
  isNew: boolean;
  onClick: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

function getFileIcon(type: string): string {
  const icons: Record<string, string> = {
    typescript: 'TS',
    javascript: 'JS',
    python: 'PY',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    json: 'JSON',
    markdown: 'MD',
    rust: 'RS',
    go: 'GO',
    ruby: 'RB',
    java: 'JAVA',
    shell: 'SH',
    yaml: 'YML',
  };
  return icons[type] || type.toUpperCase().slice(0, 3);
}

function getTypeColor(type: string): string {
  return (theme.fileTypeColors as Record<string, string>)[type] || theme.fileTypeColors.default;
}

export function FileNode({
  file,
  position,
  isSelected,
  isPulsing,
  isNew,
  onClick,
}: FileNodeProps) {
  const typeColor = getTypeColor(file.type);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`${isPulsing ? 'file-node-pulsing' : ''} ${isNew ? 'file-node-new' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        background: theme.colors.surface,
        border: `1.5px solid ${isSelected ? theme.colors.accent : theme.colors.border}`,
        borderRadius: theme.radius.md,
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? theme.shadows.md : theme.shadows.sm,
        minWidth: '140px',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = theme.colors.accentLight;
          (e.currentTarget as HTMLElement).style.boxShadow = theme.shadows.md;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = theme.colors.border;
          (e.currentTarget as HTMLElement).style.boxShadow = theme.shadows.sm;
        }
      }}
    >
      {/* File type badge */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          right: 12,
          background: typeColor,
          color: '#fff',
          fontSize: '9px',
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: theme.fonts.mono,
          letterSpacing: '0.5px',
        }}
      >
        {getFileIcon(file.type)}
      </div>

      {/* File name */}
      <div
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: '13px',
          color: isSelected ? theme.colors.accentDark : theme.colors.text,
          fontWeight: 500,
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '150px',
        }}
      >
        {file.name}
      </div>

      {/* Last modified time */}
      <div
        style={{
          fontSize: '10px',
          color: theme.colors.textMuted,
        }}
      >
        {formatRelativeTime(file.lastModified)}
      </div>
    </div>
  );
}
