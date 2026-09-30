import http from 'http';
import fs from 'fs';
import path from 'path';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

/**
 * Starts a local loopback-only HTTP server for Career Tracker.
 * Binds strictly to 127.0.0.1 and picks an available dynamic port.
 */
export function startEmbeddedServer(baseDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Normalize URL and remove query strings / hash
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
      }

      const safePath = path.normalize(path.join(baseDir, reqPath));
      if (!safePath.startsWith(baseDir)) {
        res.statusCode = 403;
        res.end('403 Forbidden');
        return;
      }

      fs.stat(safePath, (err, stats) => {
        if (err || !stats.isFile()) {
          // Fallback to index.html for SPA if not an asset
          if (!path.extname(reqPath) || reqPath.endsWith('.html')) {
            const indexPath = path.join(baseDir, 'index.html');
            fs.readFile(indexPath, (readErr, content) => {
              if (readErr) {
                res.statusCode = 404;
                res.end('404 Not Found');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
              }
            });
            return;
          }
          res.statusCode = 404;
          res.end(`404 Not Found: ${reqPath}`);
          return;
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(safePath);
        stream.pipe(res);
      });
    });

    server.on('error', (err) => {
      reject(err);
    });

    // Listen strictly on loopback (127.0.0.1) on an available port (0)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address.port;
      const url = `http://127.0.0.1:${port}`;
      console.log(`[Career Tracker Desktop] Embedded loopback server running at ${url}`);
      resolve({ server, port, url });
    });
  });
}
