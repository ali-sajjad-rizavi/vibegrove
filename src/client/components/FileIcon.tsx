import { theme } from '../styles/theme';

interface FileIconProps {
  filename: string;
  size?: number;
}

// Get file extension from filename
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// Icon configurations for different file types
const iconConfig: Record<string, { bg: string; text: string; label: string }> = {
  ts: { bg: '#3178c6', text: '#fff', label: 'TS' },
  tsx: { bg: '#61dafb', text: '#000', label: '⚛' },
  js: { bg: '#f7df1e', text: '#000', label: 'JS' },
  jsx: { bg: '#61dafb', text: '#000', label: '⚛' },
  json: { bg: '#292929', text: '#fff', label: '{}' },
  html: { bg: '#e34c26', text: '#fff', label: '<>' },
  css: { bg: '#264de4', text: '#fff', label: '#' },
  scss: { bg: '#cc6699', text: '#fff', label: 'S' },
  md: { bg: '#083fa1', text: '#fff', label: 'M' },
  py: { bg: '#3776ab', text: '#fff', label: 'PY' },
  rs: { bg: '#dea584', text: '#000', label: 'RS' },
  go: { bg: '#00add8', text: '#fff', label: 'GO' },
  yaml: { bg: '#cb171e', text: '#fff', label: 'Y' },
  yml: { bg: '#cb171e', text: '#fff', label: 'Y' },
  sh: { bg: '#4eaa25', text: '#fff', label: '$' },
  bash: { bg: '#4eaa25', text: '#fff', label: '$' },
  sql: { bg: '#336791', text: '#fff', label: 'Q' },
  graphql: { bg: '#e10098', text: '#fff', label: '◈' },
  gql: { bg: '#e10098', text: '#fff', label: '◈' },
};

export function FileIcon({ filename, size = 16 }: FileIconProps) {
  const ext = getExtension(filename);
  const config = iconConfig[ext];

  if (config) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: 3,
          background: config.bg,
          color: config.text,
          fontSize: size * 0.55,
          fontWeight: 600,
          fontFamily: theme.fonts.mono,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {config.label}
      </span>
    );
  }

  // Default file icon
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color: theme.colors.textMuted,
        fontSize: size * 0.8,
        flexShrink: 0,
      }}
    >
      📄
    </span>
  );
}

// Folder icon component
export function FolderIcon({ isOpen, size = 16 }: { isOpen: boolean; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize: size * 0.9,
        flexShrink: 0,
      }}
    >
      {isOpen ? '📂' : '📁'}
    </span>
  );
}
