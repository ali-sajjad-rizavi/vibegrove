import { useState, useRef, useEffect } from 'react';
import type { ClaudeSession } from '@shared/types';
import { theme } from '../styles/theme';

interface SessionPickerProps {
  sessions: ClaudeSession[];
  onSelect: (sessionId: string) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function SessionPicker({ sessions, onSelect }: SessionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.sm,
          padding: '4px 8px',
          fontSize: '10px',
          color: theme.colors.textSecondary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        Session
        <span style={{ fontSize: '8px' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadows.lg,
            minWidth: '220px',
            maxHeight: '300px',
            overflow: 'auto',
            zIndex: 1001,
          }}
        >
          {sessions.length === 0 ? (
            <div
              style={{
                padding: '12px 14px',
                fontSize: '12px',
                color: theme.colors.textMuted,
                textAlign: 'center',
              }}
            >
              No recent sessions
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelect(session.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `1px solid ${theme.colors.borderLight}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = theme.colors.bgWarm;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: theme.colors.text,
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {session.name}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: theme.colors.textMuted,
                  }}
                >
                  {formatDate(session.lastActive)}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
