
import 'dotenv/config';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';
import User from './src/models/userModel.js';
import Post from './src/models/postModel.js';
import Like from './src/models/likeModel.js';
import Comment from './src/models/commentModel.js';
import Notification from './src/models/notificationModel.js';

const commentTexts = [
  'This is absolutely beautiful! ✨',
  'I love the atmosphere here!',
  'Such an amazing discovery!',
  'This looks like something from another world.',
  'Adding this to my list of places to visit!',
  'The details are incredible. ❤️',
  'I could spend hours here!',
  'What a wonderful find!',
  'This picture tells such a lovely story.',
  'Absolutely magical! 🪄',
  'I really like this idea!',
  'Thanks for sharing this!',
];

const seedInteractions = async () => {
  try {
    await connectDB();

    const users = await User.find().sort({ username: 1 });

    const posts = await Post.find({
      image: /^uploads\/demo\//,
    }).sort({ createdAt: 1, _id: 1 });

    if (users.length < 2) {
      throw new Error('Not enough users in the database.');
    }

    if (posts.length === 0) {
      throw new Error('No demo posts found.');
    }

    let createdLikes = 0;
    let skippedLikes = 0;
    let createdComments = 0;
    let skippedComments = 0;
    let createdNotifications = 0;

    for (let postIndex = 0; postIndex < posts.length; postIndex++) {
      const post = posts[postIndex];

      const candidates = users.filter(
        (user) => user._id.toString() !== post.user.toString()
      );

      // 4 likes from different users
      for (let i = 0; i < 4; i++) {
        const liker = candidates[(postIndex + i * 2) % candidates.length];

        let like = await Like.findOne({
          user: liker._id,
          post: post._id,
        });

        if (!like) {
          like = new Like({
            user: liker._id,
            post: post._id,
          });

          await like.save();
          createdLikes++;
        } else {
          skippedLikes++;
        }

        await Post.updateOne(
          { _id: post._id },
          { $addToSet: { likes: liker._id } }
        );

        const existingNotification = await Notification.findOne({
          user: post.user,
          fromUser: liker._id,
          type: 'like',
          post: post._id,
        });

        if (!existingNotification) {
          await Notification.create({
            user: post.user,
            fromUser: liker._id,
            type: 'like',
            post: post._id,
          });

          createdNotifications++;
        }
      }

      // 2 comments from different users
      for (let i = 0; i < 2; i++) {
        const commenter =
          candidates[(postIndex + i + 1) % candidates.length];

        const text =
          commentTexts[(postIndex * 2 + i) % commentTexts.length];

        let comment = await Comment.findOne({
          user: commenter._id,
          post: post._id,
          text,
        });

        if (!comment) {
          comment = await Comment.create({
            user: commenter._id,
            post: post._id,
            text,
          });

          createdComments++;
        } else {
          skippedComments++;
        }

        await Post.updateOne(
          { _id: post._id },
          { $addToSet: { comments: comment._id } }
        );

        const existingNotification = await Notification.findOne({
          user: post.user,
          fromUser: commenter._id,
          type: 'comment',
          post: post._id,
          commentText: text,
        });

        if (!existingNotification) {
          await Notification.create({
            user: post.user,
            fromUser: commenter._id,
            type: 'comment',
            post: post._id,
            commentText: text,
          });

          createdNotifications++;
        }
      }

      console.log(`Processed post ${postIndex + 1}/${posts.length}`);
    }

    console.log('\nDemo interactions seeding completed!');
    console.log(`Posts processed: ${posts.length}`);
    console.log(`Likes created: ${createdLikes}`);
    console.log(`Likes skipped: ${skippedLikes}`);
    console.log(`Comments created: ${createdComments}`);
    console.log(`Comments skipped: ${skippedComments}`);
    console.log(`Notifications created: ${createdNotifications}`);
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedInteractions();
