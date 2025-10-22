import express from "express";
import { auth } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import Location from "../models/Location";

const router = express.Router();

// Add GET endpoint for listing locations
router.get("/list-locations", auth, async (req: AuthRequest, res) => {
  try {
    const { level, parentId } = req.query;

    const query: { level?: number; parentId?: string | null } = {};

    if (level) {
      query.level = parseInt(level as string);
    }

    if (parentId) {
      query.parentId = parentId as string;
    }

    const locations = await Location.find(query).sort({ name: 1 });
    res.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Existing POST endpoint
router.post("/locations", auth, async (req: AuthRequest, res) => {
  try {
    // Add type checking for request body
    if (typeof req.body !== "object" || !req.body) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Check if user has permission
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { name, level, parentId } = req.body;

    // Validate level range
    if (level < 1 || level > 5) {
      return res.status(400).json({ error: "Level must be between 1 and 5" });
    }

    // Validate required fields
    if (!name || !level) {
      return res.status(400).json({ error: "Name and level are required" });
    }

    // If it's not a top-level location, verify parent exists
    if (level > 1) {
      if (!parentId) {
        return res.status(400).json({
          error: "Parent ID is required for nested locations",
        });
      }

      // Check if parent exists
      const parent = await Location.findById(parentId);
      if (!parent) {
        return res.status(404).json({ error: "Parent location not found" });
      }

      // Validate parent level
      if (parent.level >= level) {
        return res.status(400).json({
          error: "Parent location must be of a lower level",
        });
      }
    }

    // Check for duplicate name at the same level
    const existingLocation = await Location.findOne({
      name: name,
      level: level,
    });

    if (existingLocation) {
      return res.status(400).json({
        error: `A location with name "${name}" already exists at level ${level}`,
      });
    }

    const location = new Location({
      name,
      level,
      parentId: parentId || null,
    });

    await location.save();
    res.status(201).json(location);
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to create location",
    });
  }
});

router.delete("/locations/:id", auth, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Check if location has children
    const hasChildren = await Location.exists({ parentId: req.params.id });
    if (hasChildren) {
      return res.status(400).json({
        error:
          "Cannot delete location with child locations. Delete children first.",
      });
    }

    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: "Failed to delete location" });
  }
});

router.patch("/locations/:id", auth, async (req: AuthRequest, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { name } = req.body;
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Check for duplicate name at the same level
    const existingLocation = await Location.findOne({
      _id: { $ne: req.params.id },
      name: name,
      level: location.level,
    });

    if (existingLocation) {
      return res.status(400).json({
        error: `A location with name "${name}" already exists at level ${location.level}`,
      });
    }

    location.name = name;
    await location.save();

    res.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

export default router;
