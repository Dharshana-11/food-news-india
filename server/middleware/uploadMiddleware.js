import multer, { diskStorage } from "multer";
import path, { join, extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory: /uploads/documents
const uploadPath = join(__dirname, "..", "uploads", "documents");

// Ensure directory exists
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

/**
 * Multer storage configuration
 * - Stores file in /uploads/documents
 * - Generates unique file name
 */
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter:
 * Allows only PDF, JPG, JPEG, PNG
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
  }

  cb(null, true);
};

/**
 * Multer Upload Middleware
 * - Max file size: 10MB
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;
