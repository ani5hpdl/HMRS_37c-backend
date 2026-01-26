const RoomAmenity = require("../models/roomAmenityModel");
const RoomType = require("../models/roomTypeModel");

// Create / Add amenities for a RoomType
const createRoomAmenity = async (req, res) => {
  try {
    const { roomTypeId, wifi, airConditioning, flatScreenTV, miniFridge, coffeeTeaMaker, ensuiteBathroom, bathtub, hasBalcony, hasWorkDesk } = req.body;

    if (!roomTypeId) return res.status(400).json({ success: false, message: "roomTypeId is required" });

    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) return res.status(404).json({ success: false, message: "RoomType not found" });

    // Check if amenities already exist for this RoomType
    const existingAmenity = await RoomAmenity.findOne({ where: { roomTypeId } });
    if (existingAmenity) return res.status(409).json({ success: false, message: "Amenities already set for this RoomType" });

    const amenity = await RoomAmenity.create({
      roomTypeId,
      wifi,
      airConditioning,
      flatScreenTV,
      miniFridge,
      coffeeTeaMaker,
      ensuiteBathroom,
      bathtub,
      hasBalcony,
      hasWorkDesk
    });

    return res.status(201).json({ success: true, message: "Room amenities created", data: amenity });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating amenities", error: error.message });
  }
};

// Get amenities by RoomType
const getAmenitiesByRoomType = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const amenities = await RoomAmenity.findOne({ where: { roomTypeId } });

    if (!amenities) return res.status(404).json({ success: false, message: "Amenities not found" });

    return res.status(200).json({ success: true, data: amenities });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching amenities", error: error.message });
  }
};

// Update amenities
const updateAmenities = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const amenity = await RoomAmenity.findOne({ where: { roomTypeId } });

    if (!amenity) return res.status(404).json({ success: false, message: "Amenities not found" });

    await amenity.update(req.body);
    return res.status(200).json({ success: true, message: "Amenities updated", data: amenity });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating amenities", error: error.message });
  }
};

// Delete amenities
const deleteAmenities = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const amenity = await RoomAmenity.findOne({ where: { roomTypeId } });

    if (!amenity) return res.status(404).json({ success: false, message: "Amenities not found" });

    await amenity.destroy();
    return res.status(200).json({ success: true, message: "Amenities deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting amenities", error: error.message });
  }
};

module.exports = {
  createRoomAmenity,
  getAmenitiesByRoomType,
  updateAmenities,
  deleteAmenities,
};
