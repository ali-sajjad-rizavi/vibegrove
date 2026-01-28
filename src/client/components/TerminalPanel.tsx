import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SessionPicker } from './SessionPicker';
import { useDraggable } from '../hooks/useDraggable';
import { useResizable } from '../hooks/useResizable';
import type { ClaudeSession } from '@shared/types';
import { theme } from '../styles/theme';

interface TerminalPanelProps {
  terminalData: string;
  sessions: ClaudeSession[];
  connected: boolean;
  onInput: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
  onSessionResume: (sessionId: string) => void;
}

export function TerminalPanel({
  terminalData,
  sessions,
  connected,
  onInput,
  onResize,
  onSessionResume,
}: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const lastDataLengthRef = useRef(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const { position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: {
      x: typeof window !== 'undefined' ? window.innerWidth - 380 : 500,
      y: typeof window !== 'undefined' ? window.innerHeight - 360 : 400,
    },
  });

  const { size, handleResizeStart } = useResizable({
    initialSize: { width: 350, height: 300 },
    minSize: { width: 280, height: 180 },
    maxSize: { width: 700, height: 500 },
  });

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const terminal = new Terminal({
      theme: {
        background: theme.colors.surface,
        foreground: theme.colors.text,
        cursor: theme.colors.accent,
        cursorAccent: theme.colors.surface,
        selectionBackground: theme.colors.accentLight,
      },
      fontFamily: theme.fonts.mono,
      fontSize: 12,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    terminal.onData((data) => {
      onInput(data);
    });

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Initial resize notification
    onResize(terminal.cols, terminal.rows);

    return () => {
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [onInput, onResize]);

  // Handle terminal output
  useEffect(() => {
    if (xtermRef.current && terminalData.length > lastDataLengthRef.current) {
      const newData = terminalData.slice(lastDataLengthRef.current);
      xtermRef.current.write(newData);
      lastDataLengthRef.current = terminalData.length;
    }
  }, [terminalData]);

  // Handle resize
  useEffect(() => {
    if (fitAddonRef.current && xtermRef.current && !isMinimized) {
      // Small delay to allow DOM to update
      requestAnimationFrame(() => {
        fitAddonRef.current?.fit();
        if (xtermRef.current) {
          onResize(xtermRef.current.cols, xtermRef.current.rows);
        }
      });
    }
  }, [size, isMinimized, onResize]);

  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          background: theme.colors.surface,
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.lg,
          zIndex: 1000,
          overflow: 'hidden',
        }}
      >
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: connected ? theme.colors.accent : theme.colors.deleted,
              }}
            />
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: '11px',
                color: theme.colors.textSecondary,
                letterSpacing: '1px',
              }}
            >
              CLAUDE
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.textMuted,
              cursor: 'pointer',
              fontSize: '14px',
              padding: '2px 6px',
            }}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.lg,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: connected ? theme.colors.accent : theme.colors.deleted,
            }}
          />
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '11px',
              color: theme.colors.textSecondary,
              letterSpacing: '1px',
            }}
          >
            CLAUDE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SessionPicker sessions={sessions} onSelect={onSessionResume} />
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.textMuted,
              cursor: 'pointer',
              fontSize: '14px',
              padding: '2px 6px',
            }}
          >
            −
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '8px',
          overflow: 'hidden',
        }}
      />

      {/* Resize handles */}
      <div
        onMouseDown={handleResizeStart('e')}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '6px',
          height: '100%',
          cursor: 'ew-resize',
        }}
      />
      <div
        onMouseDown={handleResizeStart('s')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '6px',
          cursor: 'ns-resize',
        }}
      />
      <div
        onMouseDown={handleResizeStart('se')}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '12px',
          height: '12px',
          cursor: 'nwse-resize',
        }}
      />
    </div>
  );
}
