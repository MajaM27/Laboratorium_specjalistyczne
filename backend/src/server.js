import { config } from './config.js';
import { applySchema } from './db/index.js';
import { createApp } from './app.js';

applySchema();

createApp().listen(config.port, () => {
  console.log(`PetCare API działa na http://localhost:${config.port}/api (${config.env})`);
});
