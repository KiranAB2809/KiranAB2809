// Zero-dependency static file server used both for `npm start` and by the
// PDF / OG generator scripts (which need a real http:// origin for fetch()
// to work — file:// URLs cannot fetch() local JSON).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const requested = path.normalize(path.join(root, decoded));
  // Block path traversal — resolved path must stay inside root.
  if (!requested.startsWith(root)) return null;
  return requested;
}

export function createServer(root = ROOT) {
  return http.createServer((req, res) => {
    let filePath = safeJoin(root, req.url || '/');
    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (filePath.endsWith(path.sep) || req.url === '/') {
      filePath = path.join(root, 'index.html');
    }
    fs.stat(filePath, (err, stat) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + req.url);
        return;
      }
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      fs.readFile(filePath, (err2, data) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found: ' + req.url);
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache'
        });
        res.end(data);
      });
    });
  });
}

// Starts the server on an ephemeral (or given) port and resolves once listening.
export function listen(port = 0, root = ROOT) {
  return new Promise((resolve) => {
    const server = createServer(root);
    server.listen(port, '127.0.0.1', () => {
      const actualPort = server.address().port;
      resolve({ server, port: actualPort, url: `http://127.0.0.1:${actualPort}` });
    });
  });
}

// If run directly: `node scripts/server.mjs` -> serve on fixed dev port.
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
  const { url } = await listen(PORT);
  console.log(`\n  Portfolio dev server running:\n\n    ${url}\n\n  Press Ctrl+C to stop.\n`);
}
