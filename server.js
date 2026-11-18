// Máy chủ cho Render.com (Vercel KHÔNG dùng file này — Vercel tự chạy thư mục /api).
// Chạy: node server.js   — Render tự đặt cổng qua biến PORT.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8'
};
const API = ['login', 'data', 'push', 'cron', 'ics', 'keys', 'status', 'shows', 'banks'];
const BLOCK = /^\/(api\/_lib|node_modules|server\.js|package(-lock)?\.json|\.)/;

// Bổ sung các hàm giống Vercel: res.status(), res.json(), res.send(), req.query, req.body
function wrap(req, res, url) {
  req.query = Object.fromEntries(url.searchParams);
  res.status = c => { res.statusCode = c; return res; };
  res.json = o => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
  res.send = b => { res.end(typeof b === 'string' || Buffer.isBuffer(b) ? b : JSON.stringify(b)); };
}
function readBody(req) {
  return new Promise(resolve => {
    let buf = '';
    req.on('data', c => { buf += c; if (buf.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(buf ? JSON.parse(buf) : {}); } catch (e) { resolve({}); } });
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);
  try {
    if (p === '/healthz') return res.end('ok');
    const m = p.match(/^\/api\/([\w-]+)$/);
    if (m && API.includes(m[1])) {
      wrap(req, res, url);
      res.setHeader('Cache-Control', 'no-store');
      req.body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : {};
      return await require('./api/' + m[1] + '.js')(req, res);
    }
    if (BLOCK.test(p) || p.includes('..')) { res.statusCode = 404; return res.end('Không tìm thấy'); }
    let file = path.join(ROOT, p === '/' ? 'index.html' : p);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, 'index.html');
    const ext = path.extname(file);
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', p === '/sw.js' || ext === '.html' ? 'no-cache' : 'public, max-age=3600');
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json; charset=utf-8'); }
    res.end(JSON.stringify({ error: e.message || 'Lỗi máy chủ' }));
  }
}).listen(PORT, () => console.log('Quản Lý $ Của Kim đang chạy ở cổng ' + PORT));
