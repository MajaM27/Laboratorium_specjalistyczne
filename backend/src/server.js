import { config } from './config.js';
import { db, applySchema } from './db/index.js';
import { createApp } from './app.js';

applySchema();

const server = createApp().listen(config.port, () => {
  console.log(`PetCare API działa na http://localhost:${config.port}/api (${config.env})`);
  if (config.env === 'production') {
    console.log(`Aplikacja (frontend z ${config.frontendDist}): http://localhost:${config.port}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} jest zajęty – zmień PORT w backend/.env.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

// Ctrl+C / zatrzymanie procesu: kończymy obsługę żądań i zamykamy bazę
function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
