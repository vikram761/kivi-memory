import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://kivi_user:kivi_password@localhost:5432/kivi_memory';

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
