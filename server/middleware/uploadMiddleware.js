import multer, { diskStorage } from "multer";
import path, { join, extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/documents exists
const uploadPath = join(__dirname, "..", "uploads", "documents");
if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

const storage = diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase(); 
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, unique);
    }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PDF, JPG, PNG allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export default upload;
