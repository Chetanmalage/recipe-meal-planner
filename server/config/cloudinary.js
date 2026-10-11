const multer = require('multer');

const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'dummy' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'dummy' &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== 'dummy'
);

let upload;

if (hasCloudinary) {
  // Real Cloudinary storage
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'arshiya-recipes',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp/;
      if (allowed.test(file.mimetype)) return cb(null, true);
      cb(new Error('Only JPG, PNG, and WEBP files are allowed'));
    },
  });

  console.log('✅ Cloudinary storage ready');
} else {
  // Dev fallback — accepts file in memory but does NOT save it.
  // The frontend must send an `imageUrl` string instead.
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  console.warn('⚠️  Cloudinary not configured. Image uploads will be ignored.');
  console.warn('   → Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
  console.warn('   → Or provide an `imageUrl` field from the frontend.');
}

module.exports = { upload };