import mongoose from "mongoose";

const ambulanceOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    start: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    end: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "ACCEPTED",
        "CANCELLED",
        "REJECTED",
        "COMPLETED",
        "SOS",
      ],
      default: "REQUESTED",
      index: true,
    },
    date: {
      type: String,
      default: Date.now(),
    },
    time: {
      type: String,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    fare: {
      type: Number,
      default: 0,
      min: 0,
    },
    vehicle: {
      type: String,
      required: true,
    },
    isVerfied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const AmbulanceOrder = mongoose.model(
  "AmbulanceOrder",
  ambulanceOrderSchema
);
