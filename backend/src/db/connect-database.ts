import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    if (env.DB_REQUIRED) {
      throw error;
    }

    console.warn('MongoDB connection skipped. Server will start without an active database.');
    return false;
  }
}

export function getDatabaseStatus() {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return states[mongoose.connection.readyState] ?? 'unknown';
}
