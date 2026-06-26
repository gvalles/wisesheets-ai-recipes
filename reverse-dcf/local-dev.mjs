import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import proxyHandler from './api/proxy.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);

function loadEnvFile(name) {
  const path = join(__dir, name);
  if (!existsSync(path)) return;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

createServer(async (req, res) => {
  if (req.url?.startsWith('/api/proxy/')) {
    await proxyHandler(req, res);
    return;
  }

  const html = readFileSync(join(__dir, 'index.html'));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(html);
}).listen(PORT, () => {
  console.log(`Local Wisesheets recipe: http://localhost:${PORT}`);
});
