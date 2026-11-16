
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Post from './src/models/postModel.js';
import User from './src/models/userModel.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from './src/utils/cloudinaryUpload.js';

const APPLY_CHANGES = process.argv.includes('--apply');

const normalizeLocalPath = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const normalized = value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

  return normalized.startsWith('uploads/')
    ? normalized
    : null;
};

const readLocalImage = async (imagePath) => {
  const relativePath = normalizeLocalPath(imagePath);

  if (!relativePath) {
    throw new Error(`Invalid local image path: ${imagePath}`);
  }

  const uploadsRoot = path.resolve(process.cwd(), 'uploads');
  const filePath = path.resolve(process.cwd(), relativePath);

  if (!filePath.startsWith(uploadsRoot + path.sep)) {
    throw new Error(`Image path is outside uploads: ${imagePath}`);
  }

  return fs.readFile(filePath);
};

const migratePosts = async () => {
  const posts = await Post.find({});
  let ready = 0;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  console.log('\n--- POST IMAGES ---');

  for (const post of posts) {
    const localPath = normalizeLocalPath(post.image);

    if (!localPath || post.imagePublicId) {
      skipped++;
      continue;
    }

    try {
      const buffer = await readLocalImage(localPath);

      if (!APPLY_CHANGES) {
        console.log(`[READY] ${localPath}`);
        ready++;
        continue;
      }

      const uploaded = await uploadToCloudinary(
        buffer,
        'ichgram/posts'
      );

      try {
        post.image = uploaded.url;
        post.imagePublicId = uploaded.publicId;
        await post.save();
      } catch (error) {
        await deleteFromCloudinary(uploaded.publicId);
        throw error;
      }

      console.log(`[MIGRATED] ${localPath}`);
      migrated++;
    } catch (error) {
      console.error(`[ERROR] ${localPath}: ${error.message}`);
      failed++;
    }
  }

  console.log('Post images:', {
    ready,
    migrated,
    skipped,
    failed,
  });
};

const migrateAvatars = async () => {
  const users = await User.find({});
  let ready = 0;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  console.log('\n--- USER AVATARS ---');

  for (const user of users) {
    const localPath = normalizeLocalPath(user.avatar);

if (!localPath || user.avatarPublicId) {
  console.log(
    `[SKIPPED] ${user.username}: ${
      user.avatarPublicId
        ? 'already in Cloudinary'
        : 'no local avatar'
    }`
  );
  skipped++;
  continue;
}

    try {
      const buffer = await readLocalImage(localPath);

      if (!APPLY_CHANGES) {
        console.log(`[READY] ${user.username}: ${localPath}`);
        ready++;
        continue;
      }

      const uploaded = await uploadToCloudinary(
        buffer,
        'ichgram/avatars'
      );

      try {
        user.avatar = uploaded.url;
        user.avatarPublicId = uploaded.publicId;
        await user.save();
      } catch (error) {
        await deleteFromCloudinary(uploaded.publicId);
        throw error;
      }

      console.log(`[MIGRATED] ${user.username}`);
      migrated++;
    } catch (error) {
      console.error(
        `[ERROR] ${user.username}: ${error.message}`
      );
      failed++;
    }
  }

  console.log('User avatars:', {
    ready,
    migrated,
    skipped,
    failed,
  });
};

const main = async () => {
  try {
    await connectDB();

    console.log(
      APPLY_CHANGES
        ? '\nCLOUDINARY MIGRATION: APPLY MODE'
        : '\nCLOUDINARY MIGRATION: DRY RUN'
    );

    await migratePosts();
    await migrateAvatars();

    console.log('\nMigration script finished.');

    if (!APPLY_CHANGES) {
      console.log(
        '\nNothing was changed. To perform the migration, run:'
      );
      console.log('node migrateImagesToCloudinary.js --apply');
    }
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

main();
