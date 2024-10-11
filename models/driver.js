import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    carNo: {
      type: String,
      required: true,
    },
    carModel: {
      type: String,
      required: true,
    },
    carYear: {
      type: Number,
      required: true,
    },
    drivingLicense: {
      photo: {
        type: String,
        required: true,
      },
      licenseNumber: {
        type: String,
        required: true,
      },
    },
    aadharCard: {
      photo: {
        type: String,
        required: true,
      },
      aadharNumber: {
        type: String,
        required: true,
      },
    },
    employmentType: {
      type: String,
      enum: ["Salaried", "Freelancer"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    vehicle: {
      type: String, // Vehicle as a string to match with CabOrder's vehicle field
      required: true,
    },
    permit: {
      area: {
        type: String,
        enum: ["ALL Bihar", "ALL India"],
        required: true,
      },
      photo: {
        type: String,
        required: true,
      },
    },
    isVerfied: {
      type: Boolean,
      default: false,
    },
    fcm: {
      type: String,
    },
    clerk_id: {
      type: String,
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Driver = mongoose.model("Driver", driverSchema);
