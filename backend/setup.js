import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const initialUsers = [
  {
    username: 'mitul',
    password: 'mitul7890',
    role: 'admin'
  },
  {
    username: 'awed',
    password: 'awed7890',
    role: 'staff'
  }
];

async function setupUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing users first
    console.log('Clearing existing users...');
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Create new users
    for (const userData of initialUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`Created ${userData.role} user: ${userData.username}`);
    }

    console.log('Setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

setupUsers();
