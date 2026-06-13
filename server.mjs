import { createServer } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { handleShortLinkProxy } from './short-link-proxy.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const BUILD_DIR = join(__dirname, 'build');
const PORT = Number(process.env.PORT) || 3000;
const API_URL =
  process.env.API_URL || process.env.VITE_API_URL || 'https://api.blackcollar.io';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function safePath(pathname) {
  const normalized = pathname.split('?')[0].split('#')[0];
  const resolved = join(BUILD_DIR, normalized);
  if (!resolved.startsWith(BUILD_DIR)) return null;
  return resolved;
}

function serveFile(res, filePath) {
  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}

function serveSpaFallback(res) {
  const indexPath = join(BUILD_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Frontend build not found. Run npm run build first.');
    return;
  }
  serveFile(res, indexPath);
}

async function handleRequest(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const handled = await handleShortLinkProxy(req, res, { apiUrl: API_URL });
    if (handled) return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = safePath(pathname);
  if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
    if (req.method === 'HEAD') {
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end();
      return;
    }
    serveFile(res, filePath);
    return;
  }

  if (req.method === 'HEAD') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end();
    return;
  }
  serveSpaFallback(res);
}

createServer(handleRequest).listen(PORT, () => {
  console.log(`Links frontend listening on :${PORT} (API_URL=${API_URL})`);
});
