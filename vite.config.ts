import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import https from 'https';
import {defineConfig, Plugin} from 'vite';

function imageUploadPlugin(): Plugin {
  return {
    name: 'vite-plugin-image-upload',
    configureServer(server) {
      server.middlewares.use('/api/upload', (req, res) => {
        if (req.method === 'POST') {
          const fileNameHeader = req.headers['x-file-name'];
          let rawName = typeof fileNameHeader === 'string' ? decodeURIComponent(fileNameHeader) : 'champion_image.png';
          
          const ext = path.extname(rawName) || '.png';
          const baseName = path.basename(rawName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
          const finalFileName = `${baseName}_${Date.now()}${ext}`;
          
          const publicDir = path.resolve(__dirname, 'public');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }

          const targetPath = path.join(publicDir, finalFileName);
          const chunks: Buffer[] = [];
          
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              // 1. Save local copy to public/ directory
              fs.writeFileSync(targetPath, buffer);

              // 2. Upload to ImageKit.io REST API
              const authHeader = 'Basic ' + Buffer.from('private_xd0dqMmEyjl/tOb+3PeP5R4Ylag=' + ':').toString('base64');
              const base64File = buffer.toString('base64');

              const postData = new URLSearchParams({
                file: `data:image/${ext.replace('.', '') || 'png'};base64,${base64File}`,
                fileName: finalFileName,
                publicKey: 'public_4xJrmuozjePE+d6nOK8b0ZWegWw=',
                useUniqueFileName: 'true',
                folder: '/wwe_champions'
              }).toString();

              const ikReq = https.request({
                hostname: 'upload.imagekit.io',
                path: '/api/v1/files/upload',
                method: 'POST',
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(postData)
                }
              }, (ikRes) => {
                let ikBody = '';
                ikRes.on('data', (d) => ikBody += d);
                ikRes.on('end', () => {
                  try {
                    const ikJson = JSON.parse(ikBody);
                    if (ikJson.url) {
                      console.log(`[ImageKit Upload Success] URL: ${ikJson.url}`);
                      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                      res.end(JSON.stringify({ success: true, url: ikJson.url, fileName: finalFileName }));
                      return;
                    }
                  } catch (e) {
                    console.error('[ImageKit Response Parse Error]', ikBody);
                  }
                  // Fallback to local URL if ImageKit response was unexpected
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                  res.end(JSON.stringify({ success: true, url: `/${finalFileName}`, fileName: finalFileName }));
                });
              });

              ikReq.on('error', (err) => {
                console.error('[ImageKit Upload Error]', err);
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ success: true, url: `/${finalFileName}`, fileName: finalFileName }));
              });

              ikReq.write(postData);
              ikReq.end();
            } catch (err: any) {
              console.error('[Upload API Error]', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), imageUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        usePolling: true,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
    },
  };
});
