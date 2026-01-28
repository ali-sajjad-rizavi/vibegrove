import { theme } from '../styles/theme';

interface HelpBarProps {
  text: string;
  connected: boolean;
}

export function HelpBar({ text, connected }: HelpBarProps) {
  return (
    <div
      style={{
        padding: '10px 20px',
        background: theme.colors.surface,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: theme.colors.textSecondary,
        }}
      >
        {text}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: theme.colors.textMuted,
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: connected ? theme.colors.accent : theme.colors.deleted,
          }}
        />
        {connected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
}
