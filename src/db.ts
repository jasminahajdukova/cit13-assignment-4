// The connection pool. Created once, imported everywhere.
//
// The settings come from the environment, which npm run reads from .env.
// Never put a password in this file.

import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});
