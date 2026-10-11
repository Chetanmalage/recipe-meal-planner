const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'dummy' &&
  process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'dummy' &&
  process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'dummy'
);

const imageFilter = (req, file, callback) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(null, true);
  callback(new Error('Only JPG, PNG, and WebP files are allowed'));
};

let storage;
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  storage = {
    _handleFile(req, file, callback) {
      const stream = cloudinary.uploader.upload_stream({
        folder: 'arshiya-recipes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
      }, (error, result) => {
        if (error) return callback(error);
        callback(null, { path: result.secure_url, secure_url: result.secure_url, public_id: result.public_id, size: result.bytes });
      });
      file.stream.pipe(stream);
    },
    _removeFile(req, file, callback) {
      if (!file.public_id) return callback(null);
      cloudinary.uploader.destroy(file.public_id).then(() => callback(null)).catch(callback);
    },
  };
  console.log('Cloudinary image storage enabled');
} else {
  // Development convenience: small images are stored as data URLs in MongoDB.
  storage = multer.memoryStorage();
  console.warn('Cloudinary is not configured; images up to 3 MB will be stored in MongoDB for local development.');
}

const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 }, fileFilter: imageFilter });
module.exports = { upload, hasCloudinary };
