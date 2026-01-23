const RoomType = require("../models/roomTypeModel");
const RoomAmenity = require("../models/roomAmenityModel");
const Room = require('../models/roomModel');

// Create a new RoomType
const createRoomType = async (req, res) => {
  try {
    const { name, description, roomSize, bedType, viewType, pricePerNight, amenities } = req.body;

    if (!name || !description || !bedType || !pricePerNight) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const existingType = await RoomType.findOne({ where: { name } });
    if (existingType) {
      return res.status(409).json({ success: false, message: "RoomType already exists" });
    }

    // Create RoomType first
    const roomType = await RoomType.create({ name, description, roomSize, bedType, viewType, pricePerNight });

    // Create amenities if provided
    if (amenities) {
      await RoomAmenity.create({ roomTypeId: roomType.id, ...amenities });
    }

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
    const { amenities, ...roomTypeData } = req.body;

    const roomType = await RoomType.findByPk(id);
    if (!roomType) return res.status(404).json({ success: false, message: "RoomType not found" });

    await roomType.update(roomTypeData);

    if (amenities) {
      // Check if amenities exist
      const existingAmenity = await RoomAmenity.findOne({ where: { roomTypeId: id } });
      if (existingAmenity) {
        await existingAmenity.update(amenities);
      } else {
        await RoomAmenity.create({ roomTypeId: id, ...amenities });
      }
    }

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
    if (!roomType) 
      return res.status(404).json({ success: false, message: "RoomType not found" });

    // Check if any rooms reference this RoomType
    const roomsUsingType = await Room.count({ where: { roomTypeId: id } });
    if (roomsUsingType > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete RoomType because it is assigned to existing rooms." 
      });
    }

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
