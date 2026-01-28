import fs from 'fs';
import path from 'path';
import os from 'os';
import type { ClaudeSession } from '../shared/types.js';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

interface SessionMetadata {
  lastUpdated?: number;
  name?: string;
}

export async function getClaudeSessions(): Promise<ClaudeSession[]> {
  const sessions: ClaudeSession[] = [];

  try {
    // Check if .claude directory exists
    if (!fs.existsSync(CLAUDE_DIR)) {
      return sessions;
    }

    // Look for sessions in the projects directory
    if (fs.existsSync(PROJECTS_DIR)) {
      const projects = fs.readdirSync(PROJECTS_DIR);

      for (const project of projects) {
        const projectPath = path.join(PROJECTS_DIR, project);
        const stat = fs.statSync(projectPath);

        if (stat.isDirectory()) {
          // Look for session files in each project
          const files = fs.readdirSync(projectPath);

          for (const file of files) {
            if (file.endsWith('.json') && !file.startsWith('.')) {
              const sessionId = file.replace('.json', '');
              const sessionPath = path.join(projectPath, file);

              try {
                const fileStat = fs.statSync(sessionPath);
                const content = fs.readFileSync(sessionPath, 'utf-8');
                const metadata: SessionMetadata = JSON.parse(content);

                sessions.push({
                  id: `${project}/${sessionId}`,
                  name: metadata.name || `${project} - ${sessionId.slice(0, 8)}`,
                  lastActive: metadata.lastUpdated || fileStat.mtimeMs,
                });
              } catch {
                // Skip invalid session files
              }
            }
          }
        }
      }
    }

    // Also check for direct session files in .claude
    const claudeFiles = fs.readdirSync(CLAUDE_DIR);
    for (const file of claudeFiles) {
      if (file.endsWith('.json') && !file.startsWith('.')) {
        const sessionPath = path.join(CLAUDE_DIR, file);
        const stat = fs.statSync(sessionPath);

        if (stat.isFile()) {
          const sessionId = file.replace('.json', '');
          sessions.push({
            id: sessionId,
            name: `Session ${sessionId.slice(0, 8)}`,
            lastActive: stat.mtimeMs,
          });
        }
      }
    }

    // Sort by most recent first
    sessions.sort((a, b) => b.lastActive - a.lastActive);

    // Return only the 20 most recent sessions
    return sessions.slice(0, 20);
  } catch (error) {
    console.error('Error reading Claude sessions:', error);
    return sessions;
  }
}
