// Единое место, где описано, какие данные поста отдаём клиенту
export const populatePostData = (query) =>
  query
    .populate('user', 'username avatar')
    .populate({
      path: 'comments',
      populate: [
        { path: 'user', select: 'username avatar' },
        { path: 'likes', select: 'username' },
      ],
    })
    .populate('likes', 'username');
