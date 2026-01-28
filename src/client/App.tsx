import { useState, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { TerminalPanel } from './components/TerminalPanel';
import { FilePreview } from './components/FilePreview';
import { ViewSwitcher, ViewType } from './components/ViewSwitcher';
import { ZoomControls } from './components/ZoomControls';
import { HelpBar } from './components/HelpBar';
import { useWebSocket } from './hooks/useWebSocket';
import { useCanvas } from './hooks/useCanvas';
import type { FileNode, ImportEdge, ClaudeSession } from '@shared/types';
import { theme } from './styles/theme';

export default function App() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [importEdges, setImportEdges] = useState<ImportEdge[]>([]);
  const [sessions, setSessions] = useState<ClaudeSession[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [pulsingFiles, setPulsingFiles] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<ViewType>('garden');

  const {
    zoom,
    pan,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    zoomIn,
    zoomOut,
  } = useCanvas();

  const { send, terminalData, connected } = useWebSocket({
    onFileList: (data) => setFiles(data.files),
    onImportGraph: (graph) => setImportEdges(graph.edges),
    onSessionList: (list) => setSessions(list.sessions),
    onFileCreated: (event) => {
      setFiles((prev) => {
        const exists = prev.some((f) => f.path === event.path);
        if (exists) return prev;
        const name = event.path.split('/').pop() || event.path;
        const ext = name.split('.').pop() || '';
        return [...prev, {
          path: event.path,
          name,
          type: ext,
          lastModified: event.timestamp,
        }];
      });
      setNewFiles((prev) => new Set(prev).add(event.path));
      setTimeout(() => {
        setNewFiles((prev) => {
          const next = new Set(prev);
          next.delete(event.path);
          return next;
        });
      }, 500);
    },
    onFileModified: (event) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.path === event.path ? { ...f, lastModified: event.timestamp } : f
        )
      );
      setPulsingFiles((prev) => new Set(prev).add(event.path));
      setTimeout(() => {
        setPulsingFiles((prev) => {
          const next = new Set(prev);
          next.delete(event.path);
          return next;
        });
      }, 1500);
    },
    onFileDeleted: (event) => {
      setFiles((prev) => prev.filter((f) => f.path !== event.path));
      if (selectedFile?.path === event.path) {
        setSelectedFile(null);
      }
    },
    onFileContent: (response) => {
      if (selectedFile && response.path === selectedFile.path) {
        setFileContent(response.content);
      }
    },
  });

  const handleFileSelect = useCallback((file: FileNode) => {
    setSelectedFile(file);
    send({ type: 'file:content:request', path: file.path });
  }, [send]);

  const handleFileClose = useCallback(() => {
    setSelectedFile(null);
    setFileContent('');
  }, []);

  const handleTerminalInput = useCallback((data: string) => {
    send({ type: 'terminal:input', data });
  }, [send]);

  const handleTerminalResize = useCallback((cols: number, rows: number) => {
    send({ type: 'terminal:resize', cols, rows });
  }, [send]);

  const handleSessionResume = useCallback((sessionId: string) => {
    send({ type: 'session:resume', sessionId });
  }, [send]);

  const helpText = selectedFile
    ? `Viewing: ${selectedFile.path}`
    : 'Drag to pan, scroll to zoom. Files pulse when modified. Click to preview.';

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.bg,
        fontFamily: theme.fonts.sans,
      }}
    >
      {/* View Switcher */}
      <ViewSwitcher
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Canvas Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <Canvas
          files={files}
          importEdges={importEdges}
          zoom={zoom}
          pan={pan}
          selectedFile={selectedFile}
          pulsingFiles={pulsingFiles}
          newFiles={newFiles}
          onFileSelect={handleFileSelect}
        />

        {/* Floating Terminal Panel */}
        <TerminalPanel
          terminalData={terminalData}
          sessions={sessions}
          connected={connected}
          onInput={handleTerminalInput}
          onResize={handleTerminalResize}
          onSessionResume={handleSessionResume}
        />

        {/* File Preview Panel */}
        {selectedFile && (
          <FilePreview
            file={selectedFile}
            content={fileContent}
            onClose={handleFileClose}
          />
        )}

        {/* Zoom Controls */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
      </div>

      {/* Help Bar */}
      <HelpBar text={helpText} connected={connected} />
    </div>
  );
}
