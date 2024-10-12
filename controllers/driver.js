// controllers/driverController.js
import { Driver } from "../models/driver.js";
// import cloudinary from "../utils/cloudinary.js";

import { Readable } from "stream";
import jwt from "jsonwebtoken";
// Convert Buffer to a readable stream
import { v2 as cloudinary } from "cloudinary";
import { VehicleCategory } from "../models/vehicleCategory.js";

// Utility function to upload an image to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); // Resolve with the URL
        }
      })
      .end(fileBuffer); // Pass the buffer here directly
  });
};

// Create a new driver
export const createDriver = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      carNo,
      carModel,
      carYear,
      licenseNumber,
      aadharNumber,
      employmentType,
      password,
      vehicle,
      area,
      clerk_id,
      category,
    } = req.body;

    if (
      !req.files ||
      !req.files.drivingLicense ||
      !req.files.aadharCard ||
      !req.files.permit
    ) {
      return res.status(400).json({ message: "Missing required files" });
    }
    const vehicleCategory = await VehicleCategory.findOne({ name: category });
    if (!vehicleCategory) {
      return res.status(404).json({ message: "Vehicle category not found" });
    }

    // Upload files to Cloudinary
    const drivingLicensePhoto = await uploadToCloudinary(
      req.files.drivingLicense[0].buffer, // Use buffer here
      "drivers/drivingLicense"
    );
    const aadharCardPhoto = await uploadToCloudinary(
      req.files.aadharCard[0].buffer, // Use buffer here
      "drivers/aadharCard"
    );
    const permitPhoto = await uploadToCloudinary(
      req.files.permit[0].buffer, // Use buffer here
      "drivers/permit"
    );

    // Create the driver object in the database
    const driver = new Driver({
      name,
      phone,
      email,
      carNo,
      carModel,
      carYear,
      drivingLicense: {
        photo: drivingLicensePhoto,
        licenseNumber,
      },
      aadharCard: {
        photo: aadharCardPhoto,
        aadharNumber,
      },
      employmentType,
      password,
      vehicle,
      permit: {
        area,
        photo: permitPhoto,
      },
      clerk_id,
      category,
    });

    await driver.save(); // Save to the database

    res.status(201).json({ message: "Driver created successfully", driver });
  } catch (error) {
    console.error("Error creating driver:", error);
    res.status(500).json({ message: "Error creating driver", error });
  }
};

// Update an existing driver
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const updateData = { ...req.body };

    // Optionally update the photos if provided
    if (req.files && req.files.drivingLicense) {
      const drivingLicensePhoto = await uploadToCloudinary(
        req.files.drivingLicense[0].buffer,
        "drivers/drivingLicense"
      );
      updateData.drivingLicense = {
        ...driver.drivingLicense,
        photo: drivingLicensePhoto,
      };
    }
    if (req.files && req.files.aadharCard) {
      const aadharCardPhoto = await uploadToCloudinary(
        req.files.aadharCard[0].buffer,
        "drivers/aadharCard"
      );
      updateData.aadharCard = { ...driver.aadharCard, photo: aadharCardPhoto };
    }
    if (req.files && req.files.permit) {
      const permitPhoto = await uploadToCloudinary(
        req.files.permit[0].buffer,
        "drivers/permit"
      );
      updateData.permit = { ...driver.permit, photo: permitPhoto };
    }

    await Driver.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Driver updated successfully", driver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating driver", error });
  }
};

export const loginDriver = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET);

    await driver.save();
    res
      .status(200)
      .json({ message: "Driver logged in successfully", token, driver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in driver", error });
  }
};
