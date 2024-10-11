import mongoose from "mongoose";

const vehicleCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    ],
  },
  { timestamps: true }
);

export const VehicleCategory = mongoose.model(
  "VehicleCategory",
  vehicleCategorySchema
);
