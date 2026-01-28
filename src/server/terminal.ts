import * as nodePty from 'node-pty';
import fs from 'fs';

export interface IPty {
  onData: (callback: (data: string) => void) => void;
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
  isActive: boolean;
}

function getShell(): string {
  if (process.platform === 'win32') {
    return 'powershell.exe';
  }

  const shells = [
    process.env.SHELL,
    '/bin/zsh',
    '/bin/bash',
    '/bin/sh',
  ].filter((s): s is string => !!s);

  for (const shell of shells) {
    try {
      if (fs.existsSync(shell)) {
        return shell;
      }
    } catch {
      // Continue to next shell
    }
  }

  return '/bin/sh';
}

// Mock terminal when real terminal isn't available
function createMockTerminal(): IPty {
  console.log('Using mock terminal (terminal features disabled)');
  const dataCallbacks: ((data: string) => void)[] = [];

  setTimeout(() => {
    const message = '\r\n\x1b[33m[VibeGrove] Terminal not available - node-pty failed to initialize.\x1b[0m\r\n' +
      '\x1b[33mFile visualization works normally. To enable terminal:\x1b[0m\r\n' +
      '\x1b[90m  npm rebuild node-pty --build-from-source\x1b[0m\r\n\r\n';
    dataCallbacks.forEach((cb) => cb(message));
  }, 100);

  return {
    onData: (callback) => {
      dataCallbacks.push(callback);
    },
    write: (data) => {
      dataCallbacks.forEach((cb) => cb(data));
    },
    resize: () => {},
    kill: () => {},
    isActive: false,
  };
}

export function createTerminal(cwd: string): IPty {
  const shell = getShell();

  // Clean environment
  const cleanEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      cleanEnv[key] = value;
    }
  }

  try {
    const term = nodePty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd,
      env: cleanEnv,
    });

    console.log(`Terminal started with shell: ${shell}`);

    return {
      onData: (callback) => {
        term.onData(callback);
      },
      write: (data) => {
        term.write(data);
      },
      resize: (cols, rows) => {
        term.resize(cols, rows);
      },
      kill: () => {
        term.kill();
      },
      isActive: true,
    };
  } catch (error) {
    console.error('node-pty failed:', (error as Error).message);
    return createMockTerminal();
  }
}

export function writeToTerminal(term: IPty, data: string): void {
  term.write(data);
}

export function resizeTerminal(term: IPty, cols: number, rows: number): void {
  term.resize(cols, rows);
}
