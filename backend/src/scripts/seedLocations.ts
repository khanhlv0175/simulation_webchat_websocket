import mongoose from "mongoose";
import Location from "../models/Location";

async function seedLocations() {
  try {
    await mongoose.connect("mongodb://localhost:27017/webchat");

    // Clear existing locations
    await Location.deleteMany({});

    // Create cities (level 1)
    const hanoi = await Location.create({
      name: "Hà Nội",
      level: 1,
    });

    const hcm = await Location.create({
      name: "Hồ Chí Minh",
      level: 1,
    });

    const danang = await Location.create({
      name: "Đà Nẵng",
      level: 1,
    });

    // Create districts (level 2)
    const cauGiay = await Location.create({
      name: "Cầu Giấy",
      level: 2,
      parentId: hanoi._id,
    });

    const baDinh = await Location.create({
      name: "Ba Đình",
      level: 2,
      parentId: hanoi._id,
    });

    const hoanKiem = await Location.create({
      name: "Hoàn Kiếm",
      level: 2,
      parentId: hanoi._id,
    });

    const quan1 = await Location.create({
      name: "Quận 1",
      level: 2,
      parentId: hcm._id,
    });

    const quan2 = await Location.create({
      name: "Quận 2",
      level: 2,
      parentId: hcm._id,
    });

    // Create wards (level 3)
    const dichVong = await Location.create({
      name: "Dịch Vọng",
      level: 3,
      parentId: cauGiay._id,
    });

    const maiDich = await Location.create({
      name: "Mai Dịch",
      level: 3,
      parentId: cauGiay._id,
    });

    // Create neighborhoods (level 4)
    const to1 = await Location.create({
      name: "Tổ 1",
      level: 4,
      parentId: dichVong._id,
    });

    const to2 = await Location.create({
      name: "Tổ 2",
      level: 4,
      parentId: dichVong._id,
    });

    // Create buildings (level 5)
    await Location.create([
      {
        name: "Chung cư A",
        level: 5,
        parentId: to1._id,
      },
      {
        name: "Chung cư B",
        level: 5,
        parentId: to1._id,
      },
    ]);

    console.log("Locations seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding locations:", error);
    process.exit(1);
  }
}

seedLocations();
