const express = require("express");
const router = express.Router();
const {
  createRoomAmenity,
  getAmenitiesByRoomType,
  updateAmenities,
  deleteAmenities
} = require("../controllers/roomAmenityController");

const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");

// Create amenities for a RoomType (Admin only)
router.post("/", authMiddleware, isAdmin, createRoomAmenity);

// Get amenities by RoomType ID
router.get("/:roomTypeId", authMiddleware, getAmenitiesByRoomType);

// Update amenities (Admin only)
router.put("/:roomTypeId", authMiddleware, isAdmin, updateAmenities);

// Delete amenities (Admin only)
router.delete("/:roomTypeId", authMiddleware, isAdmin, deleteAmenities);

module.exports = router;
