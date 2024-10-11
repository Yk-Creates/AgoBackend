import multer from "multer";

// Multer storage setup
const storage = multer.memoryStorage(); // Store files as buffer

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});
