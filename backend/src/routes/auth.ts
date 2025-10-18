import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { auth } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";

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

export default router;
