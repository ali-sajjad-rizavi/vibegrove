export const theme = {
  colors: {
    // Calm color palette - morning light feeling
    bg: '#faf9f7',
    bgWarm: '#f5f3ef',
    surface: '#ffffff',
    surfaceHover: '#f8f7f5',

    // Text colors
    text: '#2a2a2a',
    textSecondary: '#666666',
    textMuted: '#999999',

    // Accent colors - soft sage and warm tones
    accent: '#7c9a82',
    accentLight: '#a8c4ae',
    accentDark: '#5a7a60',
    warm: '#c4a574',
    warmLight: '#e8d5b7',

    // Status colors
    modified: '#d4a574',
    created: '#7c9a82',
    deleted: '#c47474',

    // Borders
    border: '#e8e6e3',
    borderLight: '#f0eeeb',
  },

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
  },

  fonts: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  },

  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 16,
  },

  // File type to color mapping
  fileTypeColors: {
    typescript: '#3178c6',
    javascript: '#f7df1e',
    python: '#3776ab',
    css: '#264de4',
    scss: '#cc6699',
    html: '#e34c26',
    json: '#292929',
    markdown: '#083fa1',
    rust: '#dea584',
    go: '#00add8',
    ruby: '#cc342d',
    java: '#b07219',
    default: '#6a9a6a',
  },
} as const;

export type Theme = typeof theme;
