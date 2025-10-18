import mongoose from "mongoose";
import User from "../models/User";

async function createTestUser() {
  try {
    await mongoose.connect("mongodb://localhost:27017/webchat");

    await User.create({
      name: "Admin User",
      username: "admin",
      password: "admin123",
      role: "admin",
    });

    console.log("Test user created successfully");
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();
