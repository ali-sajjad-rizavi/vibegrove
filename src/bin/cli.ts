#!/usr/bin/env node
import { startServer } from '../server/index.js';
import open from 'open';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const projectDir = process.cwd();

console.log(`
╔═══════════════════════════════════════╗
║           VibeGrove IDE               ║
║     A calm space for vibe coding      ║
╚═══════════════════════════════════════╝
`);

console.log(`Starting VibeGrove for: ${projectDir}\n`);

// Start the server
startServer(projectDir);

// Open browser after a short delay
setTimeout(() => {
  const url = `http://localhost:${PORT}`;
  console.log(`Opening ${url} in your browser...\n`);
  open(url).catch(() => {
    console.log(`Could not open browser automatically. Please open ${url} manually.`);
  });
}, 1000);
