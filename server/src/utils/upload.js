
import multer from 'multer';

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const fileFilter = (req, file, cb) => {
  if (EXT_BY_MIME[file.mimetype]) {
    return cb(null, true);
  }

  const err = new Error('Only JPEG, PNG and WEBP images are allowed');
  err.statusCode = 400;
  cb(err, false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
