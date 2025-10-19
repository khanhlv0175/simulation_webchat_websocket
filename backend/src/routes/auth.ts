import express from "express";
import { auth } from "../middleware/auth";
import User from "../models/User";
import bcrypt from "bcryptjs";

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get user information endpoint
router.get("/me/information", auth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    res.json({
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user information" });
  }
});

// Register endpoint
router.post("/register", auth, async (req, res) => {
  try {
    const { name, username, password, role, locations } = req.body;

    // Validate locations array
    if (!Array.isArray(locations)) {
      return res.status(400).json({ error: "Locations must be an array" });
    }

    // Only admin can create new users
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admin can create new users" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create new user with locations array
    const user = new User({
      name,
      username,
      password, // Will be hashed by the pre-save hook
      role,
      locations,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        name: user.name,
        username: user.username,
        role: user.role,
        locations: user.locations,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default router;
