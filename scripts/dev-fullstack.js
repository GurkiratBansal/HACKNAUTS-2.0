// FRESH:FILE  Script to start both Express backend (Supabase PostgreSQL) and frontend (Vite) concurrently.
// FRESH:AREA  DevOps

import { spawn } from 'node:child_process'
import process from 'node:process'

console.log('🌱 Starting FRESH Full-Stack with Supabase Cloud Database + Vite Frontend...')

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

const backend = spawn(npmCmd, ['--prefix', 'server', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '4000' },
})

const frontend = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_BACKEND_URL: 'http://localhost:4000' },
})

function shutdown() {
  backend.kill('SIGINT')
  frontend.kill('SIGINT')
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
