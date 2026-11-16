
import 'dotenv/config';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';
import User from './src/models/userModel.js';
import Post from './src/models/postModel.js';
import Like from './src/models/likeModel.js';
import Notification from './src/models/notificationModel.js';

const shuffle = (array) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const randomizeDemoFeed = async () => {
  try {
    await connectDB();

    const users = await User.find();

    const posts = await Post.find({
      image: /^uploads\/demo\//,
    });

    if (posts.length === 0) {
      throw new Error('No demo posts found.');
    }

    const likeCounts = shuffle([
      0, 2, 5, 7, 3, 1, 6,
      4, 2, 5, 0, 3, 7, 1,
      4, 6, 2, 3, 5, 0, 7,
      4, 1, 6, 2, 5, 3, 0,
    ]);

    const mixedPosts = shuffle(posts);

    let addedLikes = 0;
    let removedLikes = 0;

    for (let i = 0; i < mixedPosts.length; i++) {
      const post = mixedPosts[i];
      const desiredCount = likeCounts[i];

      const candidates = shuffle(
        users.filter(
          (user) =>
            user._id.toString() !== post.user.toString()
        )
      );

      const selectedUsers = candidates.slice(0, desiredCount);
      const selectedIds = selectedUsers.map((user) => user._id);

      const oldLikes = await Like.find({ post: post._id });

      const oldSelected = oldLikes.filter((like) =>
        selectedIds.some(
          (id) => id.toString() === like.user.toString()
        )
      );

      removedLikes += oldLikes.length - oldSelected.length;

      await Like.deleteMany({
        post: post._id,
        user: { $nin: selectedIds },
      });

      await Notification.deleteMany({
        post: post._id,
        type: 'like',
        fromUser: { $nin: selectedIds },
      });

      for (const user of selectedUsers) {
        const existingLike = await Like.findOne({
          post: post._id,
          user: user._id,
        });

        if (!existingLike) {
          await Like.create({
            post: post._id,
            user: user._id,
          });

          addedLikes++;
        }

        const existingNotification = await Notification.findOne({
          post: post._id,
          type: 'like',
          user: post.user,
          fromUser: user._id,
        });

        if (!existingNotification) {
          await Notification.create({
            post: post._id,
            user: post.user,
            fromUser: user._id,
            type: 'like',
          });
        }
      }

      await Post.updateOne(
        { _id: post._id },
        { $set: { likes: selectedIds } },
        { timestamps: false }
      );

      // Mix publication dates so the feed displays posts in random order.
      const newDate = new Date(Date.now() - i * 60 * 1000);

      await Post.collection.updateOne(
        { _id: post._id },
        { $set: { createdAt: newDate } }
      );

      console.log(
        `Post ${i + 1}: ${desiredCount} likes`
      );
    }

    console.log('\nDemo feed randomized successfully!');
    console.log(`Posts mixed: ${mixedPosts.length}`);
    console.log(`New likes added: ${addedLikes}`);
    console.log(`Old likes removed: ${removedLikes}`);
    console.log('Like notifications synchronized.');
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

randomizeDemoFeed();
