import { theme } from '../styles/theme';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut }: ZoomControlsProps) {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 100,
      }}
    >
      <button
        onClick={onZoomIn}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          color: theme.colors.textSecondary,
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows.sm,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = theme.colors.bgWarm;
          (e.currentTarget as HTMLElement).style.borderColor = theme.colors.accent;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = theme.colors.surface;
          (e.currentTarget as HTMLElement).style.borderColor = theme.colors.border;
        }}
      >
        +
      </button>

      <div
        style={{
          fontSize: '11px',
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.mono,
          minWidth: '40px',
          textAlign: 'center',
        }}
      >
        {zoomPercent}%
      </div>

      <button
        onClick={onZoomOut}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          color: theme.colors.textSecondary,
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows.sm,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = theme.colors.bgWarm;
          (e.currentTarget as HTMLElement).style.borderColor = theme.colors.accent;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = theme.colors.surface;
          (e.currentTarget as HTMLElement).style.borderColor = theme.colors.border;
        }}
      >
        −
      </button>
    </div>
  );
}
