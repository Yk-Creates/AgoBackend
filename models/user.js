import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
    },
    fcmToken: {
      type: String,
      required: false,
    },
  },
  { timeseries: true }
);
export const User = mongoose.model("User",userSchema);