// utils/multerCloudinary.js

import multer from "multer";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier"; // Needed for converting buffer into a stream

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload middleware for multiple files
export const cloudinaryUpload = (req, res, next) => {
  if (!req.files) return next();

  console.log("Uploading files to Cloudinary...");

  const uploads = Object.keys(req.files).map(async (field) => {
    const fileBuffer = req.files[field][0].buffer;
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `drivers/${field}` },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(error);
          }
          console.log("Cloudinary Upload Success:", result.secure_url);
          resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  });

  // Wait for all uploads to complete
  Promise.all(uploads)
    .then((urls) => {
      console.log("All files uploaded successfully:", urls);
      req.uploadedFiles = urls;
      next(); // Move to next middleware
    })
    .catch((error) => {
      console.error("Error during file upload:", error);
      return res
        .status(500)
        .json({ message: "Cloudinary upload error", error });
    });
};

export const uploadHandler = upload.fields([
  { name: "drivingLicense", maxCount: 1 },
  { name: "aadharCard", maxCount: 1 },
  { name: "permit", maxCount: 1 },
]);
