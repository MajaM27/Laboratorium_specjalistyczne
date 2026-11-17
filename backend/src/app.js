import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import petsRouter from './routes/pets.js';
import visitsRouter from './routes/visits.js';
import statsRouter from './routes/stats.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { pickLanguage } from './utils/i18n.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by'); // nie ujawniamy, że serwer działa na Express

  app.use(cors({ origin: config.corsOrigin }));
  // Język komunikatów (pl/en) z nagłówka Accept-Language – domyślnie polski
  app.use((req, res, next) => {
    req.lang = pickLanguage(req.headers['accept-language']);
    res.vary('Accept-Language');
    next();
  });
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/pets', petsRouter);
  app.use('/api/visits', visitsRouter);
  app.use('/api/stats', statsRouter);

  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
