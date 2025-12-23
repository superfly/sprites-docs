const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = '/home/sprite/docs/.vitepress/dist';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  // Clean URLs: /foo -> /foo.html
  let file = path.join(ROOT, url);

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  } else if (!path.extname(file) && fs.existsSync(file + '.html')) {
    file = file + '.html';
  }

  if (!fs.existsSync(file)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(file);
  const mime = MIME[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Serving ${ROOT} on http://0.0.0.0:${PORT}`);
});
