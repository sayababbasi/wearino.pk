import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Aggressive sanitization: strip everything except alphanumeric, underscore, and hyphen
const clean = (val) => val ? val.toString().replace(/[^\w-]/g, '').trim() : '';

const cloudName = clean(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = clean(process.env.CLOUDINARY_API_KEY);
const apiSecret = clean(process.env.CLOUDINARY_API_SECRET);

console.log(`[CLOUDINARY] Initializing with Cloud Name: ${cloudName} (Length: ${cloudName.length})`);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const isCloudinaryConfigured = cloudName && cloudName !== 'your_cloud_name' && apiKey;

let storage;

if (isCloudinaryConfigured) {
  console.log("[CLOUDINARY] Using Cloudinary Storage");
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wearino_products',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
  });
} else {
  console.log("[CLOUDINARY] Cloudinary not configured, falling back to local storage");
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
