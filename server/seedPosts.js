
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

import connectDB from './src/config/db.js';
import User from './src/models/userModel.js';
import Post from './src/models/postModel.js';

const demoFolders = [
  {
    folder: 'libraries',
    users: ['sofia_travels', 'noah_photography'],
    captions: [
      'A quiet corner, endless stories and a little bit of magic. 📚',
      'Some places make you forget about time.',
      'My favourite place to get lost in a good book.',
      'Every old library has a thousand secrets.',
      'A perfect afternoon surrounded by stories.',
      'Where imagination has no limits. ✨',
    ],
  },
  {
    folder: 'books_objects',
    users: ['sofia_travels', 'alex_outdoors'],
    captions: [
      'Found another little treasure today. 🔍',
      'Old books have a special kind of charm.',
      'A collection of curious things and forgotten stories.',
      'The details are what make these objects special.',
      'A little piece of history in my hands.',
      'I could spend hours exploring this collection.',
    ],
  },
  {
    folder: 'castles',
    users: ['daniel_creates', 'noah_photography'],
    captions: [
      'Architecture that makes you stop and stare.',
      'A journey through history, one building at a time.',
      'Imagine the stories hidden behind these walls.',
      'Some places feel like they belong to another world.',
      'A perfect destination for my next adventure.',
      'The details, the atmosphere, the history. Incredible!',
    ],
  },
  {
    folder: 'magic_objects',
    users: ['lucas_tech', 'emma_lifestyle'],
    captions: [
      'A mysterious little discovery. ✨',
      'Curiosity is the beginning of every great experiment.',
      'A touch of magic in everyday life.',
      'I wonder what this object was used for...',
      'Some things are better left unexplained.',
      'Today’s favourite object from my collection.',
    ],
  },
  {
    folder: 'events',
    users: ['mia_foodie', 'olivia_moves', 'emma_lifestyle', 'noah_photography'],
    captions: [
      'An evening full of wonderful moments and new memories.',
      'Good company, beautiful atmosphere and a little magic.',
      'One of those evenings you wish would never end.',
      'A special event with truly special people. ✨',
    ],
  },
];

const seedPosts = async () => {
  try {
    await connectDB();

    let created = 0;
    let skipped = 0;
    let postNumber = 0;

    for (const category of demoFolders) {
      const folderPath = path.join(
        process.cwd(),
        'uploads',
        'demo',
        category.folder
      );

      const files = await fs.readdir(folderPath);

      const imageFiles = files
        .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .sort();

      if (imageFiles.length === 0) {
        console.log(`No photos found in: ${category.folder}`);
        continue;
      }

      for (let i = 0; i < imageFiles.length; i++) {
        const filename = imageFiles[i];
        const imagePath = `uploads/demo/${category.folder}/${filename}`;

        const existingPost = await Post.findOne({ image: imagePath });

        if (existingPost) {
          console.log(`Skipped existing post: ${filename}`);
          skipped++;
          continue;
        }

        const username =
          category.users[i % category.users.length];

        const user = await User.findOne({ username });

        if (!user) {
          throw new Error(`Demo user not found: ${username}`);
        }

        const caption =
          category.captions[i % category.captions.length];

        const post = new Post({
          user: user._id,
          description: caption,
          image: imagePath,
          createdAt: new Date(Date.now() - postNumber * 6 * 60 * 60 * 1000),
        });

        await post.save();

        console.log(`Created: ${username} → ${filename}`);
        created++;
        postNumber++;
      }
    }

    console.log('\nDemo posts seeding completed!');
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedPosts();
