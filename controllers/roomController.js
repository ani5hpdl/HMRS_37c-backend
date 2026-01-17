const { Op } = require("sequelize");
const { Room, RoomType, RoomAmenity, Reservation } = require("../models");

// Create a new room
const createRooms = async (req, res) => {
  const { roomTypeId, maxGuests } = req.body;

  if (!roomTypeId || !maxGuests) {
    return res.status(400).json({
      success: false,
      message: "roomTypeId and maxGuests are required",
    });
  }

  try {
    // Check if RoomType exists
    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: "RoomType not found",
      });
    }

    // Create room
    const newRoom = await Room.create({
      roomTypeId,
      maxGuests,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while adding room",
      error: error.message,
    });
  }
};

// Get all rooms with RoomType and Amenities
const getAllRooms = async (req, res) => {
  try {
    const { isActive, maxGuests, viewType } = req.query;
    const whereClause = {};
    if (isActive !== undefined) whereClause.isActive = isActive === "true";
    if (maxGuests) whereClause.maxGuests = maxGuests;

    const rooms = await Room.findAll({
      where: whereClause,
      include: {
        model: RoomType,
        include: RoomAmenity,
        ...(viewType ? { where: { viewType } } : {}),
      },
    });

    return res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};

// Get room by ID with RoomType and Amenities
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: {
        model: RoomType,
        include: RoomAmenity,
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

// Update room (only maxGuests or roomType)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    const { roomTypeId, maxGuests } = req.body;

    if (roomTypeId) {
      const roomType = await RoomType.findByPk(roomTypeId);
      if (!roomType) {
        return res.status(404).json({ success: false, message: "RoomType not found" });
      }
      room.roomTypeId = roomTypeId;
    }

    if (maxGuests) room.maxGuests = maxGuests;

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message,
    });
  }
};

// Deactivate room
const deactivateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    room.isActive = false;
    await room.save();

    return res.status(200).json({ success: true, message: "Room deactivated successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate room",
      error: error.message,
    });
  }
};

// Delete room permanently
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    await room.destroy();

    return res.status(200).json({ success: true, message: "Room deleted permanently" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

// Get available rooms
const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, maxGuests, viewType } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "checkInDate and checkOutDate are required",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "checkOutDate must be after checkInDate",
      });
    }

    // Find booked rooms
    const bookedRooms = await Reservation.findAll({
      attributes: ["roomId"],
      where: {
        [Op.and]: [
          { checkInDate: { [Op.lt]: checkOut } },
          { checkOutDate: { [Op.gt]: checkIn } },
        ],
      },
    });

    const bookedRoomIds = bookedRooms.map((r) => r.roomId);

    const whereClause = { isActive: true, id: { [Op.notIn]: bookedRoomIds } };
    if (maxGuests) whereClause.maxGuests = { [Op.gte]: maxGuests };

    // Fetch available rooms including RoomType & Amenities
    const availableRooms = await Room.findAll({
      where: whereClause,
      include: {
        model: RoomType,
        include: RoomAmenity,
        ...(viewType ? { where: { viewType } } : {}),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Available rooms fetched successfully",
      data: availableRooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available rooms",
      error: error.message,
    });
  }
};

module.exports = {
  createRooms,
  getAllRooms,
  getRoomById,
  updateRoom,
  deactivateRoom,
  deleteRoom,
  getAvailableRooms,
};
