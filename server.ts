import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { apiV1Router } from './server/routesV1';
import { initializeDatabase } from './server/db/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  // Initialize embedded PostgreSQL schema & migrations
  await initializeDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON request body parser & cookie parser
  app.use(express.json());
  app.use(cookieParser());

  // Mount API v1 router
  app.use('/api/v1', apiV1Router);

  // Mount legacy API router for backwards compatibility where needed
  app.use('/api', apiRouter);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CashDeck Financial Engine', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CashDeck] Server running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode.`);
  });
}

bootstrap().catch(err => {
  console.error('[CashDeck] Server bootstrap failed:', err);
  process.exit(1);
});
