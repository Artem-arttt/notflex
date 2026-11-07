import { env } from './config/env.js';
import app from './app.js';

app.listen(env.port, () => {
  console.log(`NotFlex API запущен: http://localhost:${env.port}`);
});