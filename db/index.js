import mongoose from "mongoose";
// import { DB_NAME } from "../contants/constants.js";

const connectDB = async () => {
  try {
    const dbConnectionInstance = await mongoose.connect(
      `mongodb+srv://y123:y123@cluster0.cyiwt.mongodb.net/ago?retryWrites=true&w=majority&appName=Cluster0`
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
