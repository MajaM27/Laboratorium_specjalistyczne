import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

router.get('/', (_req, res) => {
  db.prepare('SELECT 1').get();
  res.json({ status: 'ok', database: 'ok', time: new Date().toISOString() });
});

export default router;
