const express = require("express");
const router = express.Router();
const {
  createRoomType,
  getAllRoomTypes,
  updateRoomType,
  deleteRoomType
} = require("../controllers/roomTypeController");

const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");

// Create a new RoomType (Admin only)
router.post("/createRoomType", authMiddleware, isAdmin, createRoomType);

// Get all RoomTypes (any authenticated user)
router.get("/getAllRoomTypes", authMiddleware, getAllRoomTypes);

// Update RoomType (Admin only)
router.put("/updateRoomType/:id", authMiddleware, isAdmin, updateRoomType);

// Delete RoomType (Admin only)
router.delete("/delete/:id", authMiddleware, isAdmin, deleteRoomType);

module.exports = router;
