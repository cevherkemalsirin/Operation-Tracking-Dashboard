import dotenv from 'dotenv';
import app from './app.js';
import { validateEnv } from './config.js';

dotenv.config();
validateEnv();

const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
