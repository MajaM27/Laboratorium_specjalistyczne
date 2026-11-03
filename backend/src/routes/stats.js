import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { toVisit, VISIT_SELECT } from './visits.js';

const router = Router();
router.use(requireAuth);

// Dane panelu głównego: liczba zwierząt (F-C-01) i najbliższa zaplanowana wizyta (F-C-02)
router.get('/', (req, res) => {
  const counts = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM pets WHERE user_id = @userId) AS pet_count,
         (SELECT COUNT(*) FROM visits v JOIN pets p ON p.id = v.pet_id
           WHERE p.user_id = @userId AND v.status = 'planned') AS planned_count,
         (SELECT COUNT(*) FROM visits v JOIN pets p ON p.id = v.pet_id
           WHERE p.user_id = @userId AND v.status = 'done') AS done_count`,
    )
    .get({ userId: req.user.id });

  const next = db
    .prepare(
      `${VISIT_SELECT}
       WHERE p.user_id = ? AND v.status = 'planned'
       ORDER BY v.visit_datetime, v.id
       LIMIT 1`,
    )
    .get(req.user.id);

  res.json({
    petCount: counts.pet_count,
    plannedVisitCount: counts.planned_count,
    doneVisitCount: counts.done_count,
    nextVisit: next ? toVisit(next) : null,
  });
});

export default router;
