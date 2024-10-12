// routes/driverRoutes.js
import express from "express";
import {
  createDriver,
  getDriverOwnOrders,
  loginDriver,
  updateDriver,
} from "../controllers/driver.js";
import { uploadHandler, cloudinaryUpload } from "../utils/multerCloudinary.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

// Create driver route with multer handling and Cloudinary upload middleware
router.post(
  "/",
  upload.fields([
    { name: "drivingLicense", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "permit", maxCount: 1 },
  ]),
  createDriver
);

router.put(
  "/:id",
  upload.fields([
    { name: "drivingLicense", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    { name: "permit", maxCount: 1 },
  ]),
  updateDriver
);

router.post("/login", loginDriver);
router.post("/orders", getDriverOwnOrders);
export default router;
