
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

import connectDB from './src/config/db.js';
import User from './src/models/userModel.js';

const avatarFolder = path.join(
  process.cwd(),
  'uploads',
  'demo',
  'avatars'
);

const demoUsers = [
  { username: 'alex_outdoors', name: 'Alex Carter' },
  { username: 'mia_foodie', name: 'Mia Anderson' },
  { username: 'sofia_travels', name: 'Sofia Miller' },
  { username: 'emma_lifestyle', name: 'Emma Wilson' },
  { username: 'olivia_moves', name: 'Olivia Taylor' },
  { username: 'daniel_creates', name: 'Daniel Brooks' },
  { username: 'lucas_tech', name: 'Lucas Martin' },
  { username: 'noah_photography', name: 'Noah Davis' },
];

const normalize = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const seedAvatars = async () => {
  try {
    await connectDB();

    const files = await fs.readdir(avatarFolder);
    let updated = 0;

    for (const demoUser of demoUsers) {
      const expectedName = normalize(demoUser.name);

      const avatarFile = files.find((file) => {
        const extension = path.extname(file).toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];

        const baseName = normalize(
          path.basename(file, extension)
        );

        return allowed.includes(extension) &&
          baseName === expectedName;
      });

      if (!avatarFile) {
        console.log(`Photo not found: ${demoUser.name}`);
        continue;
      }

      const avatarPath = `uploads/demo/avatars/${avatarFile}`;

      const user = await User.findOneAndUpdate(
        { username: demoUser.username },
        { $set: { avatar: avatarPath } },
        { new: true }
      );

      if (!user) {
        console.log(`User not found: ${demoUser.username}`);
        continue;
      }

      console.log(`Updated: ${demoUser.name} → ${avatarFile}`);
      updated++;
    }

    console.log('\nDemo avatars seeding completed!');
    console.log(`Updated profiles: ${updated}/8`);
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedAvatars();
