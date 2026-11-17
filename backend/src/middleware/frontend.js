import fs from 'node:fs';
import path from 'node:path';
import express from 'express';

// Wersja produkcyjna: backend serwuje zbudowany frontend (frontend/dist) pod tym samym adresem
// co API – jeden serwer, brak problemów z CORS. Każda ścieżka spoza /api, która nie jest plikiem,
// dostaje index.html, żeby działało odświeżenie strony na trasach Reacta (np. /pets/3).
export function serveFrontend(distDir) {
  const indexFile = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexFile)) {
    throw new Error(`Brak zbudowanego frontendu (${indexFile}) – uruchom najpierw: npm run build`);
  }

  const router = express.Router();
  // Pliki z hashem w nazwie (assets/) można trzymać w cache długo; index.html – zawsze świeży
  router.use(
    express.static(distDir, {
      index: false,
      setHeaders(res, filePath) {
        const cache = filePath.includes(`${path.sep}assets${path.sep}`)
          ? 'public, max-age=31536000, immutable'
          : 'no-cache';
        res.set('Cache-Control', cache);
      },
    }),
  );
  router.get(/^(?!\/api(\/|$)).*/, (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(indexFile);
  });
  return router;
}
