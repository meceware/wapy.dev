import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { defineConfig, env } from 'prisma/config';

// load and expand .env variables
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
