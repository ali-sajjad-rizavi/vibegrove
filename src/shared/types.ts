// File system events
export interface FileCreated {
  type: 'file:created';
  path: string;
  timestamp: number;
}

export interface FileModified {
  type: 'file:modified';
  path: string;
  timestamp: number;
}

export interface FileDeleted {
  type: 'file:deleted';
  path: string;
  timestamp: number;
}

// Terminal events
export interface TerminalOutput {
  type: 'terminal:output';
  data: string;
}

export interface TerminalInput {
  type: 'terminal:input';
  data: string;
}

export interface TerminalResize {
  type: 'terminal:resize';
  cols: number;
  rows: number;
}

// Session management
export interface ClaudeSession {
  id: string;
  name: string;
  lastActive: number;
}

export interface SessionList {
  type: 'session:list';
  sessions: ClaudeSession[];
}

export interface SessionResume {
  type: 'session:resume';
  sessionId: string;
}

// File data for initial load
export interface FileNode {
  path: string;
  name: string;
  type: string;
  lastModified: number;
}

export interface FileList {
  type: 'file:list';
  files: FileNode[];
}

// Import relationships
export interface ImportEdge {
  from: string;
  to: string;
}

export interface ImportGraph {
  type: 'import:graph';
  edges: ImportEdge[];
}

// File content request/response
export interface FileContentRequest {
  type: 'file:content:request';
  path: string;
}

export interface FileContentResponse {
  type: 'file:content:response';
  path: string;
  content: string;
}

// Union type for all messages
export type WebSocketMessage =
  | FileCreated
  | FileModified
  | FileDeleted
  | TerminalOutput
  | TerminalInput
  | TerminalResize
  | SessionList
  | SessionResume
  | FileList
  | ImportGraph
  | FileContentRequest
  | FileContentResponse;

// Type guards
export function isFileEvent(msg: WebSocketMessage): msg is FileCreated | FileModified | FileDeleted {
  return msg.type === 'file:created' || msg.type === 'file:modified' || msg.type === 'file:deleted';
}

export function isTerminalEvent(msg: WebSocketMessage): msg is TerminalOutput | TerminalInput | TerminalResize {
  return msg.type === 'terminal:output' || msg.type === 'terminal:input' || msg.type === 'terminal:resize';
}
