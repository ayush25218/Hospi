import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDatabase } from '../db/connect-database.js';
import { UserModel } from '../modules/user/user.model.js';

async function seedAdmin() {
  await connectDatabase();

  const existingAdmin = await UserModel.findOne({ email: env.ADMIN_EMAIL });

  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      throw new Error(`Existing user ${env.ADMIN_EMAIL} is not an admin. Choose another email.`);
    }

    console.log(`Admin already exists: ${env.ADMIN_EMAIL}`);
    return;
  }

  await UserModel.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log(`Admin created successfully: ${env.ADMIN_EMAIL}`);
}

void seedAdmin()
  .catch((error) => {
    console.error('Failed to seed admin user', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
