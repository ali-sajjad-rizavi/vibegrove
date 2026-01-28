# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server (Vite on :5173, backend on :3000)
npm run build         # Build client and server for production
npm run typecheck     # TypeScript type checking
npm start             # Run production server
```

For development, use http://localhost:5173 (Vite with hot reload).

### node-pty issues on macOS

If terminal fails with `posix_spawnp failed`:
```bash
npm rebuild node-pty --build-from-source
```

## Architecture

VibeGrove is a spatial IDE that visualizes project files as nodes on a canvas with import dependency connections.

### Client-Server Communication

All real-time communication uses WebSocket (`/ws`). Message types are defined in `src/shared/types.ts` as a discriminated union (`WebSocketMessage`). Key message flows:

- **File events**: Server watches files via chokidar → broadcasts `file:created`, `file:modified`, `file:deleted`
- **Terminal I/O**: Client sends `terminal:input` → Server pipes to node-pty → Server broadcasts `terminal:output`
- **File content**: Client requests `file:content:request` → Server reads file → responds with `file:content:response`

### Server (`src/server/`)

- `index.ts` - Express server, WebSocket handling, orchestrates all modules
- `terminal.ts` - node-pty wrapper with fallback mock terminal
- `watcher.ts` - chokidar file watching, emits file events
- `imports.ts` - Parses ES6/CommonJS imports to build dependency graph
- `files.ts` - Directory scanning, file content reading
- `sessions.ts` - Reads Claude sessions from `~/.claude/`

### Client (`src/client/`)

- `App.tsx` - Main state management, WebSocket event handlers
- `hooks/useWebSocket.ts` - WebSocket connection with auto-reconnect, uses ref for callbacks to prevent reconnection loops
- `hooks/useCanvas.ts` - Pan/zoom state for canvas
- `hooks/useDraggable.ts` & `useResizable.ts` - Panel interaction hooks
- `components/Canvas.tsx` - File node layout algorithm, SVG connection lines
- `components/FileNode.tsx` - Individual file node with pulse animation on modification

### Shared Types

`src/shared/types.ts` contains all WebSocket message interfaces. Always use the `WebSocketMessage` union type for type safety.

### Path Alias

`@shared/*` maps to `src/shared/*` (configured in tsconfig.json and vite.config.ts).

## TypeScript

Strict mode enabled with `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`. No `any` types allowed.
