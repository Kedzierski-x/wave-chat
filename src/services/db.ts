// src/services/db.ts
import mongoose from "mongoose";

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    // Połączenie już nawiązane
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default connectToDatabase;
