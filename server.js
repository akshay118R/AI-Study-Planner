import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GEMMA_SYSTEM_INSTRUCTION } from './js/services/gemmaSystemPrompt.js';
import { repairAndParseJson } from './js/services/jsonRepair.js';
import { generateLocalStructuredPlan } from './js/services/aiPlanGenerator.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

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

// Load .env if present
function loadEnv() {
  try {
    const envPaths = [path.join(BASE_DIR, '.env'), path.join(BASE_DIR, '.env.local')];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (key && !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  } catch (e) {}
}
loadEnv();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 180000;
const OLLAMA_TEMPERATURE = Number(process.env.OLLAMA_TEMPERATURE) || 0.2;

async function checkOllamaHealth() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) {
      return {
        status: 'offline',
        baseUrl: OLLAMA_BASE_URL,
        model: OLLAMA_MODEL,
        error: `Ollama returned HTTP ${res.status}`
      };
    }
    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models : [];
    const target = OLLAMA_MODEL.toLowerCase();
    const hasModel = models.some(m => {
      const name = (m.name || m.model || '').toLowerCase();
      return name === target || name.startsWith(target.split(':')[0]);
    });

    if (hasModel) {
      return {
        status: 'ready',
        baseUrl: OLLAMA_BASE_URL,
        model: OLLAMA_MODEL,
        installedModels: models.map(m => m.name)
      };
    } else {
      return {
        status: 'model_missing',
        baseUrl: OLLAMA_BASE_URL,
        model: OLLAMA_MODEL,
        installedModels: models.map(m => m.name),
        installCommand: `ollama pull ${OLLAMA_MODEL}`,
        error: `Model '${OLLAMA_MODEL}' is missing in Ollama. Run: ollama pull ${OLLAMA_MODEL}`
      };
    }
  } catch (err) {
    return {
      status: 'offline',
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      error: `Could not reach Ollama at ${OLLAMA_BASE_URL}. Ensure Ollama is installed and running.`
    };
  }
}

const server = http.createServer(async (req, res) => {
  // Local AI readiness & status endpoint
  if (req.method === 'GET' && (req.url === '/api/config' || req.url === '/api/ai/status')) {
    const status = await checkOllamaHealth();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store'
    });
    res.end(JSON.stringify(status));
    return;
  }

  // Local Ollama AI generation proxy endpoint
  if (req.method === 'POST' && req.url === '/api/generate-plan') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const promptText = payload.promptText || payload.prompt || (payload.contents?.[0]?.parts?.[0]?.text);
        const systemInstruction = payload.systemInstruction || GEMMA_SYSTEM_INSTRUCTION;
        if (!promptText) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing prompt text in request payload.' }));
          return;
        }

        const health = await checkOllamaHealth();
        if (health.status === 'offline') {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Ollama is not responding. Please start Ollama at ${OLLAMA_BASE_URL} and try again.`,
            code: 'OLLAMA_OFFLINE'
          }));
          return;
        }
        if (health.status === 'model_missing') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Required model '${OLLAMA_MODEL}' is missing. Run: ollama pull ${OLLAMA_MODEL}`,
            code: 'MODEL_MISSING',
            installCommand: `ollama pull ${OLLAMA_MODEL}`
          }));
          return;
        }

        const startTime = Date.now();
        const chatRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [
              {
                role: 'system',
                content: systemInstruction
              },
              {
                role: 'user',
                content: promptText
              }
            ],
            stream: false,
            format: 'json',
            options: {
              temperature: OLLAMA_TEMPERATURE,
              num_ctx: 16384,
              num_predict: 8192
            }
          }),
          signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS)
        });

        if (!chatRes.ok) {
          const errText = await chatRes.text().catch(() => '');
          res.writeHead(chatRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Ollama error (HTTP ${chatRes.status}): ${errText || 'Inference failed'}`,
            code: 'OLLAMA_ERROR'
          }));
          return;
        }

        const chatData = await chatRes.json();
        const rawContent = chatData.message?.content || '';
        if (!rawContent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ollama returned an empty response.', code: 'EMPTY_RESPONSE' }));
          return;
        }

        let parsed = null;
        try {
          parsed = repairAndParseJson(rawContent);
        } catch (parseErr) {
          console.warn('[Ollama Plan] Direct and repaired JSON parse failed:', parseErr.message);
          if (payload.params && payload.params.goal) {
            console.log('[Ollama Plan] Falling back to deterministic structured plan for safety.');
            parsed = generateLocalStructuredPlan(payload.params);
          } else {
            throw parseErr;
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          plan: parsed,
          model: OLLAMA_MODEL,
          durationMs: Date.now() - startTime
        }));

      } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          res.writeHead(504, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Plan generation timed out after ${Math.round(OLLAMA_TIMEOUT_MS / 1000)} seconds. Local Gemma inference may need more time.`,
            code: 'TIMEOUT'
          }));
          return;
        }

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: `Failed to generate plan: ${err.message}`,
          code: 'GENERATION_FAILED'
        }));
      }
    });
    return;
  }

  // Normalize URL and remove query strings
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(path.join(BASE_DIR, reqPath));
  if (!safePath.startsWith(BASE_DIR)) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA if not an asset
      if (!path.extname(reqPath) || reqPath.endsWith('.html')) {
        const indexPath = path.join(BASE_DIR, 'index.html');
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
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`AI Study & Task Planner server running at http://localhost:${PORT}`);
});
