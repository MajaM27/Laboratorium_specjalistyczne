import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import petsRouter from './routes/pets.js';
import visitsRouter from './routes/visits.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/pets', petsRouter);
  app.use('/api/visits', visitsRouter);

  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
