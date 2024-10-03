import mongoose from "mongoose";
// import { DB_NAME } from "../contants/constants.js";

const connectDB = async () => {
  try {
    const dbConnectionInstance = await mongoose.connect(
    `mongodb+srv://kartik200327:ykcreates@ago.qw15fk5.mongodb.net/?retryWrites=true&w=majority&appName=Ago`
    // `mongodb://localhost:27017/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${dbConnectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;
