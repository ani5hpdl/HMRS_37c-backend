const RoomType = require("../models/roomTypeModel");
const RoomAmenity = require("../models/roomAmenityModel");

// Create a new RoomType
const createRoomType = async (req, res) => {
  try {
    const { name, description, roomSize, bedType, viewType, pricePerNight } = req.body;

    if (!name || !description || !bedType || !pricePerNight) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const existingType = await RoomType.findOne({ where: { name } });
    if (existingType) {
      return res.status(409).json({ success: false, message: "RoomType already exists" });
    }

    const roomType = await RoomType.create({ name, description, roomSize, bedType, viewType, pricePerNight });

    return res.status(201).json({ success: true, message: "RoomType created", data: roomType });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating RoomType", error: error.message });
  }
};

// Get all RoomTypes (with amenities)
const getAllRoomTypes = async (req, res) => {
  try {
    const roomTypes = await RoomType.findAll({
      include: [{ model: RoomAmenity, as: "amenities" }]
    });
    return res.status(200).json({ success: true, data: roomTypes });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching RoomTypes", error: error.message });
  }
};

// Update RoomType
const updateRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findByPk(id);
    if (!roomType) return res.status(404).json({ success: false, message: "RoomType not found" });

    await roomType.update(req.body);
    return res.status(200).json({ success: true, message: "RoomType updated", data: roomType });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating RoomType", error: error.message });
  }
};

// Delete RoomType
const deleteRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const roomType = await RoomType.findByPk(id);
    if (!roomType) return res.status(404).json({ success: false, message: "RoomType not found" });

    await roomType.destroy();
    return res.status(200).json({ success: true, message: "RoomType deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting RoomType", error: error.message });
  }
};

module.exports = {
  createRoomType,
  getAllRoomTypes,
  updateRoomType,
  deleteRoomType,
};
