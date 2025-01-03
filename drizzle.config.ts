import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './supabase/migrations',
  schema: './src/lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 54322,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    ssl: false
  },
});