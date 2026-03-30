import mongoose from 'mongoose';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './db/connect-database.js';
import { ensureOrganizationBackfill } from './modules/organization/organization.service.js';

const app = createApp();

async function bootstrap() {
  try {
    await connectDatabase();
    await ensureOrganizationBackfill();

    const server = app.listen(env.PORT, () => {
      console.log(`Hospi backend running on http://localhost:${env.PORT}`);
    });

    const gracefulShutdown = async (signal: NodeJS.Signals) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start backend', error);
    process.exit(1);
  }
}

void bootstrap();
