const { Op } = require("sequelize");
const { Room, RoomType, RoomAmenity } = require("../models");
const {Reservation} = require("../models/reservationModel");

// ----------------------------
// CREATE RESERVATION
// ----------------------------
const createReservation = async (req, res) => {
  try {
    const { roomId, specialRequest, checkInDate, checkOutDate, totalGuests } = req.body;

    // Validate required fields
    if (!roomId || !checkInDate || !checkOutDate || !totalGuests) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    // Validate UUID
    if (!roomId.match(/^[0-9a-fA-F-]{36}$/)) {
      return res.status(400).json({ success: false, message: "Invalid roomId format" });
    }

    // Fetch room with type & amenities
    const room = await Room.findByPk(roomId, {
      include: { model: RoomType, include: RoomAmenity }
    });

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Parse dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn)
      return res.status(400).json({ success: false, message: "Check-out must be after check-in" });

    // Check overlapping reservations
    const existingReservation = await Reservation.findOne({
      where: {
        roomId,
        [Op.and]: [
          { checkInDate: { [Op.lt]: checkOut } },
          { checkOutDate: { [Op.gt]: checkIn } }
        ]
      }
    });

    if (existingReservation) {
      return res.status(409).json({ success: false, message: "Room is already reserved for these dates" });
    }

    // Calculate nights and total price
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(room.RoomType.pricePerNight) * nights;

    // Create reservation
    const newReservation = await Reservation.create({
      guestName: req.user.name,
      guestEmail: req.user.email,
      roomId,
      specialRequest,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights,
      totalGuests,
      totalPrice
    });

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: newReservation
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating reservation",
      error: error.message
    });
  }
};

// ----------------------------
// GET ALL RESERVATIONS
// ----------------------------
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: { model: Room, include: { model: RoomType, include: RoomAmenity } }
    });

    return res.status(200).json({
      success: true,
      message: "All reservations fetched",
      data: reservations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reservations",
      error: error.message
    });
  }
};

// ----------------------------
// GET MY RESERVATIONS
// ----------------------------
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { guestEmail: req.user.email },
      include: { model: Room, include: { model: RoomType, include: RoomAmenity } }
    });

    return res.status(200).json({
      success: true,
      message: reservations.length ? "Your reservations fetched" : "No reservations found",
      data: reservations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching reservations", error: error.message });
  }
};

// ----------------------------
// GET RESERVATION BY ID
// ----------------------------
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: { model: Room, include: { model: RoomType, include: RoomAmenity } }
    });

    if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });

    return res.status(200).json({ success: true, message: "Reservation fetched", data: reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching reservation", error: error.message });
  }
};

// ----------------------------
// UPDATE RESERVATION (ADMIN)
// ----------------------------
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });

    const { status, paymentStatus } = req.body;

    await reservation.update({
      status: status || reservation.status,
      paymentStatus: paymentStatus || reservation.paymentStatus
    });

    return res.status(200).json({ success: true, message: "Reservation updated", data: reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update reservation", error: error.message });
  }
};

// ----------------------------
// UPDATE MY RESERVATION
// ----------------------------
const updateMyReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate, specialRequest, totalGuests } = req.body;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });

    if (reservation.guestEmail !== req.user.email)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Validate and check date overlap
    let newCheckIn = checkInDate ? new Date(checkInDate) : reservation.checkInDate;
    let newCheckOut = checkOutDate ? new Date(checkOutDate) : reservation.checkOutDate;

    if (newCheckOut <= newCheckIn)
      return res.status(400).json({ success: false, message: "Check-out must be after check-in" });

    const conflict = await Reservation.findOne({
      where: {
        roomId: reservation.roomId,
        id: { [Op.ne]: reservation.id },
        [Op.and]: [
          { checkInDate: { [Op.lt]: newCheckOut } },
          { checkOutDate: { [Op.gt]: newCheckIn } }
        ]
      }
    });

    if (conflict) return res.status(409).json({ success: false, message: "Room is already reserved for these dates" });

    // Update nights and totalPrice
    reservation.nights = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));
    const room = await Room.findByPk(reservation.roomId, { include: RoomType });
    reservation.totalPrice = parseFloat(room.RoomType.pricePerNight) * reservation.nights;

    // Update other fields
    reservation.checkInDate = newCheckIn;
    reservation.checkOutDate = newCheckOut;
    if (specialRequest !== undefined) reservation.specialRequest = specialRequest;
    if (totalGuests !== undefined) reservation.totalGuests = totalGuests;

    await reservation.save();

    return res.status(200).json({ success: true, message: "Reservation updated successfully", data: reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update reservation", error: error.message });
  }
};

// ----------------------------
// CANCEL MY RESERVATION
// ----------------------------
const cancelMyReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });

    if (reservation.guestEmail !== req.user.email)
      return res.status(403).json({ success: false, message: "Not authorized" });

    reservation.status = "cancelled";
    await reservation.save();

    return res.status(200).json({ success: true, message: "Reservation cancelled", data: reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to cancel reservation", error: error.message });
  }
};

// ----------------------------
// DELETE RESERVATION
// ----------------------------
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: "Reservation not found" });

    await reservation.destroy();
    return res.status(200).json({ success: true, message: "Reservation deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete reservation", error: error.message });
  }
};

// ----------------------------
// GET RESERVATIONS BY ROOM
// ----------------------------
const getReservationsByRoom = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { roomId: req.params.roomId },
      include: { model: Room, include: { model: RoomType, include: RoomAmenity } }
    });

    return res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch reservations", error: error.message });
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getMyReservations,
  getReservationById,
  updateReservation,
  updateMyReservation,
  cancelMyReservation,
  deleteReservation,
  getReservationsByRoom
};
