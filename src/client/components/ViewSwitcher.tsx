import { useState } from 'react';
import { theme } from '../styles/theme';

export type ViewType = 'campfire' | 'timeline' | 'dashboard' | 'garden';

interface ViewSwitcherProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface ViewConfig {
  id: ViewType;
  name: string;
  subtitle: string;
  available: boolean;
}

const views: ViewConfig[] = [
  { id: 'campfire', name: 'Campfire', subtitle: 'Radial Hub', available: false },
  { id: 'timeline', name: 'Timeline', subtitle: 'Horiz Flow', available: false },
  { id: 'dashboard', name: 'Dashboard', subtitle: 'Calm Control', available: false },
  { id: 'garden', name: 'Garden', subtitle: 'Spatial Canvas', available: true },
];

export function ViewSwitcher({ activeView, onViewChange }: ViewSwitcherProps) {
  const [toast, setToast] = useState<string | null>(null);

  const handleViewClick = (view: ViewConfig) => {
    if (view.available) {
      onViewChange(view.id);
    } else {
      setToast(`${view.name} is coming soon!`);
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '12px 16px',
          gap: '8px',
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        {views.map((view) => {
          const isActive = activeView === view.id;

          return (
            <button
              key={view.id}
              onClick={() => handleViewClick(view)}
              style={{
                background: isActive
                  ? theme.colors.bgWarm
                  : 'transparent',
                border: isActive
                  ? `1px solid ${theme.colors.accent}`
                  : '1px solid transparent',
                borderRadius: theme.radius.md,
                padding: '10px 20px',
                cursor: view.available ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                opacity: view.available ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                }}
              >
                {view.name}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: isActive ? theme.colors.accentLight : theme.colors.textMuted,
                  marginTop: '2px',
                }}
              >
                {view.available ? view.subtitle : 'Coming soon'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: theme.colors.text,
            color: theme.colors.surface,
            padding: '10px 20px',
            borderRadius: theme.radius.md,
            fontSize: '13px',
            zIndex: 2000,
            boxShadow: theme.shadows.lg,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
