// Local preview, including the GitHub Pages repository path.
import http from 'node:http';
import path from 'node:path';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('./', import.meta.url)));
const prefix = '/webgis-lab';
const port = Number(process.env.PORT || 4187);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.geojson':'application/geo+json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif', '.txt':'text/plain; charset=utf-8' };
const inside = target => { const rel = path.relative(root, target); return rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel); };
http.createServer(async (req, res) => {
  const fail = code => { res.writeHead(code, { 'Content-Type':'text/plain; charset=utf-8' }); res.end(http.STATUS_CODES[code]); };
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('Allow', 'GET, HEAD'); fail(405); return; }
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname === prefix) { res.writeHead(302, { Location: prefix + '/' + url.search }); res.end(); return; }
    if (!pathname.startsWith(prefix + '/')) { fail(404); return; }
    const relative = pathname.slice(prefix.length + 1);
    const parts = relative.split('/');
    if (parts.some(part => part.startsWith('.') || part.includes('\\') || part.includes(':') || part.includes('\0'))) { fail(403); return; }
    if (relative && relative !== 'index.html' && !relative.startsWith('assets/') && !relative.startsWith('projects/')) { fail(404); return; }
    let target = path.resolve(root, relative || 'index.html');
    if (!inside(target)) { fail(403); return; }
    if ((await stat(target)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); res.end(); return; }
      target = path.join(target, 'index.html');
    }
    target = await realpath(target);
    if (!inside(target)) { fail(403); return; }
    const type = types[path.extname(target).toLowerCase()];
    if (!type) { fail(404); return; }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type':type, 'Content-Length':data.length, 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) { fail(error instanceof URIError ? 400 : 404); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}${prefix}/`));
