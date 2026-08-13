import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
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
          const finalFileName = `${baseName}${ext}`;
          
          const publicDir = path.resolve(__dirname, 'public');
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }

          const targetPath = path.join(publicDir, finalFileName);
          const chunks: Buffer[] = [];
          
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              fs.writeFileSync(targetPath, buffer);
              console.log(`[Upload API] Successfully saved image to public/${finalFileName}`);
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ success: true, url: `/${finalFileName}`, fileName: finalFileName }));
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
