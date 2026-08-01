import { Pool } from '@neondatabase/serverless';

// Neon Serverless PostgreSQL Connection Pool Manager
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trendtube';

export const pool = new Pool({ connectionString });

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}
