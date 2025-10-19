import express from "express";
import { auth } from "../middleware/auth";
import mongoose from "mongoose";

const router = express.Router();

interface Location {
  id: string;
  name: string;
  level: number;
  parentId?: string;
}

// Dummy data with hierarchical structure
const locations: Location[] = [
  // Level 1 - Cities
  { id: "1", name: "Hà Nội", level: 1 },
  { id: "2", name: "Hồ Chí Minh", level: 1 },
  { id: "3", name: "Đà Nẵng", level: 1 },

  // Level 2 - Districts (Hà Nội)
  { id: "101", name: "Cầu Giấy", level: 2, parentId: "1" },
  { id: "102", name: "Ba Đình", level: 2, parentId: "1" },
  { id: "103", name: "Hoàn Kiếm", level: 2, parentId: "1" },

  // Level 2 - Districts (Hồ Chí Minh)
  { id: "201", name: "Quận 1", level: 2, parentId: "2" },
  { id: "202", name: "Quận 2", level: 2, parentId: "2" },
  { id: "203", name: "Quận 3", level: 2, parentId: "2" },

  // Level 3 - Wards (Cầu Giấy)
  { id: "1011", name: "Dịch Vọng", level: 3, parentId: "101" },
  { id: "1012", name: "Mai Dịch", level: 3, parentId: "101" },
  { id: "1013", name: "Yên Hòa", level: 3, parentId: "101" },

  // Level 4 - Neighborhoods (Dịch Vọng)
  { id: "10111", name: "Tổ 1", level: 4, parentId: "1011" },
  { id: "10112", name: "Tổ 2", level: 4, parentId: "1011" },

  // Level 5 - Buildings (Tổ 1)
  { id: "101111", name: "Chung cư A", level: 5, parentId: "10111" },
  { id: "101112", name: "Chung cư B", level: 5, parentId: "10111" },
];

router.get("/list-locations", auth, async (req, res) => {
  try {
    const { level, parentId } = req.query;

    let filteredLocations = [...locations];

    if (level) {
      filteredLocations = filteredLocations.filter(
        (loc) => loc.level === parseInt(level as string)
      );
    }

    if (parentId) {
      filteredLocations = filteredLocations.filter(
        (loc) => loc.parentId === parentId
      );
    }

    res.json({ locations: filteredLocations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

export default router;
