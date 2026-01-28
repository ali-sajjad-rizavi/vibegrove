import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTerminal, resizeTerminal, writeToTerminal } from './terminal.js';
import { createWatcher } from './watcher.js';
import { buildImportGraph } from './imports.js';
import { getClaudeSessions } from './sessions.js';
import { scanDirectory, getFileContent } from './files.js';
import type { WebSocketMessage, TerminalInput, TerminalResize, SessionResume, FileContentRequest } from '../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export function startServer(projectDir: string): void {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Serve static client files
  const clientDir = path.join(__dirname, '../client');
  app.use(express.static(clientDir));

  // Serve index.html for all routes (SPA)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });

  // Track connected clients
  const clients = new Set<WebSocket>();

  function broadcast(message: WebSocketMessage): void {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Initialize file watcher
  const watcher = createWatcher(projectDir, (event) => {
    broadcast(event);
    // Rebuild import graph on file changes
    if (event.type === 'file:created' || event.type === 'file:modified' || event.type === 'file:deleted') {
      scanDirectory(projectDir).then((files) => {
        const graph = buildImportGraph(files, projectDir);
        broadcast(graph);
      });
    }
  });

  // Initialize terminal
  const pty = createTerminal(projectDir);

  pty.onData((data: string) => {
    broadcast({ type: 'terminal:output', data });
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    // Send initial data
    Promise.all([
      scanDirectory(projectDir),
      getClaudeSessions(),
    ]).then(([files, sessions]) => {
      ws.send(JSON.stringify({ type: 'file:list', files }));
      ws.send(JSON.stringify({ type: 'session:list', sessions }));

      const graph = buildImportGraph(files, projectDir);
      ws.send(JSON.stringify(graph));
    });

    ws.on('message', (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as WebSocketMessage;
        handleMessage(message);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected');
    });
  });

  function handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'terminal:input':
        writeToTerminal(pty, (message as TerminalInput).data);
        break;
      case 'terminal:resize':
        const resize = message as TerminalResize;
        resizeTerminal(pty, resize.cols, resize.rows);
        break;
      case 'session:resume':
        const resume = message as SessionResume;
        writeToTerminal(pty, `claude --resume ${resume.sessionId}\n`);
        break;
      case 'file:content:request':
        const request = message as FileContentRequest;
        const fullPath = path.join(projectDir, request.path);
        getFileContent(fullPath).then((content) => {
          broadcast({
            type: 'file:content:response',
            path: request.path,
            content,
          });
        });
        break;
    }
  }

  server.listen(PORT, () => {
    console.log(`VibeGrove running at http://localhost:${PORT}`);
  });

  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    watcher.close();
    pty.kill();
    server.close();
    process.exit(0);
  });
}

// Allow running directly
if (process.argv[1] === __filename) {
  startServer(process.cwd());
}
