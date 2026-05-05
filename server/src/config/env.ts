import dotenv from 'dotenv';
import path from 'path';

let loaded = false;

export const loadEnv = () => {
  if (loaded) return;

  // Support running from `server/` and from project root.
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  dotenv.config({ path: path.resolve(__dirname, '../../.env.example') });
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.example') });

  loaded = true;
};
