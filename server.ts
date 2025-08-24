import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const port: number = 8000;

// MIME types mapping
interface MimeTypes {
  [key: string]: string;
}

const mimeTypes: MimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse): void => {
  console.log(`${req.method} ${req.url}`);
  
  const parsedUrl: url.UrlWithParsedQuery = url.parse(req.url || '', true);
  let pathname: string = parsedUrl.pathname || '/';
  
  // Handle root path
  if (pathname === '/') {
    pathname = '/index.php';
  }
  
  // Try to serve from casino/public first, then fall back to root
  let filePath: string = path.join(__dirname, 'casino/public', pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, pathname);
  }
  
  // If still not found and it's a PHP file, try to serve index.html instead
  if (!fs.existsSync(filePath) && path.extname(pathname) === '.php') {
    filePath = path.join(__dirname, 'casino/public/index.html');
  }
  
  // Get file extension
  const ext: string = path.extname(filePath).toLowerCase();
  const contentType: string = mimeTypes[ext] || 'text/plain';
  
  // Check if file exists
  fs.readFile(filePath, (err: NodeJS.ErrnoException | null, data: Buffer): void => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve a basic message
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Casino App</title></head>
            <body>
              <h1>Casino Application</h1>
              <p>This is a Laravel-based casino application that requires PHP to run properly.</p>
              <p>Current request: ${pathname}</p>
              <p>For full functionality, this application needs:</p>
              <ul>
                <li>PHP 8+</li>
                <li>Laravel 11</li>
                <li>MySQL Database</li>
                <li>Apache/Nginx Server</li>
              </ul>
              <p>Frontend assets have been built and are available in the casino/public directory.</p>
            </body>
          </html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(port, '0.0.0.0', (): void => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
  console.log('Serving static files from casino/public and root directory');
});

export default server;
