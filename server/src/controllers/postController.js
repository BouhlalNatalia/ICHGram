
import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';
import Like from '../models/likeModel.js';
import Notification from '../models/notificationModel.js';
import { populatePostData } from '../utils/populatePost.js';
import { removeUploadedFile } from '../utils/files.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinaryUpload.js';

const MAX_DESCRIPTION = 2200;

// Удаляет фотографию независимо от места хранения.
const removePostImage = async (image, publicId) => {
  if (publicId) {
    await deleteFromCloudinary(publicId);
  } else {
    await removeUploadedFile(image);
  }
};

// GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const posts = await populatePostData(
      Post.find().sort({ createdAt: -1 }).limit(100).lean()
    );
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/explore/all
export const getExplorePosts = async (req, res) => {
  try {
    const sampled = await Post.aggregate([{ $sample: { size: 30 } }]);
    const posts = await Post.populate(sampled, [
      { path: 'user', select: 'username avatar' },
      { path: 'likes', select: 'username' },
      {
        path: 'comments',
        populate: [
          { path: 'user', select: 'username avatar' },
          { path: 'likes', select: 'username' },
        ],
      },
    ]);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/:id
export const getPostById = async (req, res) => {
  try {
    const post = await populatePostData(Post.findById(req.params.id));
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/user/:id
export const getUserPosts = async (req, res) => {
  try {
    const posts = await populatePostData(
      Post.find({ user: req.params.id }).sort({ createdAt: -1 })
    );
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts
export const createPost = async (req, res) => {
  let uploadedImage = null;
  let postCreated = false;

  try {
    const description =
      typeof req.body.description === 'string'
        ? req.body.description.trim()
        : '';

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (description.length > MAX_DESCRIPTION) {
      return res.status(400).json({
        message: `Description must be at most ${MAX_DESCRIPTION} characters`,
      });
    }

    uploadedImage = await uploadToCloudinary(
      req.file.buffer,
      'ichgram/posts'
    );

    const post = await Post.create({
      user: req.user.id,
      description,
      image: uploadedImage.url,
      imagePublicId: uploadedImage.publicId,
    });

    postCreated = true;

    const populated = await populatePostData(
      Post.findById(post._id).lean()
    );

    res.status(201).json(populated);
  } catch (error) {
    if (uploadedImage && !postCreated) {
      await deleteFromCloudinary(uploadedImage.publicId);
    }

    res.status(500).json({ message: error.message });
  }
};

// PUT /api/posts/:id
export const updatePost = async (req, res) => {
  let uploadedImage = null;
  let postSaved = false;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You can edit only your own posts',
      });
    }

    if (typeof req.body.description === 'string') {
      const description = req.body.description.trim();

      if (description.length > MAX_DESCRIPTION) {
        return res.status(400).json({
          message: `Description must be at most ${MAX_DESCRIPTION} characters`,
        });
      }

      post.description = description;
    }

    let oldImage = null;
    let oldImagePublicId = null;

    if (req.file) {
      uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        'ichgram/posts'
      );

      oldImage = post.image;
      oldImagePublicId = post.imagePublicId;

      post.image = uploadedImage.url;
      post.imagePublicId = uploadedImage.publicId;
    }

    await post.save();
    postSaved = true;

    if (uploadedImage) {
      await removePostImage(oldImage, oldImagePublicId);
    }

    const populated = await populatePostData(
      Post.findById(post._id).lean()
    );

    res.json(populated);
  } catch (error) {
    if (uploadedImage && !postSaved) {
      await deleteFromCloudinary(uploadedImage.publicId);
    }

    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You can delete only your own posts',
      });
    }

    const commentIds = post.comments || [];

    await Promise.all([
      Comment.deleteMany({ post: post._id }),
      Like.deleteMany({
        $or: [
          { post: post._id },
          { comment: { $in: commentIds } },
        ],
      }),
      Notification.deleteMany({ post: post._id }),
    ]);

    await post.deleteOne();
    await removePostImage(post.image, post.imagePublicId);

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
