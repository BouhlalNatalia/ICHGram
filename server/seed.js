
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import User from './src/models/userModel.js';

const demoUsers = [
  {
    username: 'sofia_travels',
    email: 'sofia@ichgramm.test',
    fullName: 'Sofia Miller',
    bio: 'Exploring the world, one city at a time ✈️',
  },
  {
    username: 'daniel_creates',
    email: 'daniel@ichgramm.test',
    fullName: 'Daniel Brooks',
    bio: 'Design, technology and creative ideas 💡',
  },
  {
    username: 'emma_lifestyle',
    email: 'emma@ichgramm.test',
    fullName: 'Emma Wilson',
    bio: 'Little moments, big memories ☕',
  },
  {
    username: 'alex_outdoors',
    email: 'alex@ichgramm.test',
    fullName: 'Alex Carter',
    bio: 'Mountains, nature and weekend adventures 🌿',
  },
  {
    username: 'mia_foodie',
    email: 'mia@ichgramm.test',
    fullName: 'Mia Anderson',
    bio: 'Good food makes everything better 🍓',
  },
  {
    username: 'lucas_tech',
    email: 'lucas@ichgramm.test',
    fullName: 'Lucas Martin',
    bio: 'Building things and learning every day 💻',
  },
  {
    username: 'olivia_moves',
    email: 'olivia@ichgramm.test',
    fullName: 'Olivia Taylor',
    bio: 'Fitness, balance and positive energy 🧘',
  },
  {
    username: 'noah_photography',
    email: 'noah@ichgramm.test',
    fullName: 'Noah Davis',
    bio: 'Capturing moments through my lens 📸',
  },
];

const DEMO_PASSWORD = 'IchgrammDemo2026!';

const seedUsers = async () => {
  try {
    await connectDB();

    let created = 0;
    let skipped = 0;

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email },
        ],
      });

      if (existingUser) {
        console.log(`Skipped: ${userData.username}`);
        skipped++;
        continue;
      }

      const user = new User({
        ...userData,
        password: DEMO_PASSWORD,
        avatar: '',
      });

      await user.save();
      console.log(`Created: ${userData.username}`);
      created++;
    }

    console.log('\nDemo users seeding completed!');
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedUsers();
