const { Op } = require("sequelize");
const { Reservation, Room, RoomType, RoomAmenity } = require("../models");

// ----------------------------
// CREATE RESERVATION
// ----------------------------
const createReservation = async (req, res) => {
  console.log("Create Reservation Request Body:", req.body);

  try {
    // Extract guest information from the request body
    const { guestName, guestEmail, guestContact, roomId, specialRequest, checkInDate, checkOutDate, totalGuests } = req.body;

    // Validate required fields
    if (!guestName || !guestEmail || !guestContact || !roomId || !checkInDate || !checkOutDate || !totalGuests) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    // Validate UUID format for roomId
    if (!roomId.match(/^[0-9a-fA-F-]{36}$/)) {
      return res.status(400).json({ success: false, message: "Invalid roomId format" });
    }

    // Fetch room with type & amenities
    const room = await Room.findByPk(roomId, {
      include: {
        model: RoomType,
        include: {
          model: RoomAmenity,
          as: "amenities"
        }
      }
    });

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Parse dates and validate check-in/check-out dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) return res.status(400).json({ success: false, message: "Check-out must be after check-in" });

    // Check for overlapping reservations
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

    // Calculate number of nights and total price
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(room.RoomType.pricePerNight) * nights;

    // Track the admin's details
    const adminName = req.user.name;
    const adminEmail = req.user.email;

    // Create reservation with guest and admin details
    const newReservation = await Reservation.create({
      guestName,        // guest's name passed from frontend
      guestEmail,
      guestContact,     // guest's email passed from frontend
      addedBy: adminName,        // admin's name (optional)
      addedWith: adminEmail,       // admin's email (optional)
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
    console.error(error);
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
      include: { model: Room, include: { model: RoomType, include: {
        model: RoomAmenity,
        as: "amenities"
}
 } }
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
      where: { addedWith: req.user.email },
      include: { model: Room, include: { model: RoomType, include: {
        model: RoomAmenity,
        as: "amenities"
}
 } }
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
      include: { model: Room, include: { model: RoomType, include: {
        model: RoomAmenity,
        as: "amenities"
}
 } }
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

    if (reservation.addedWith !== req.user.email)
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
    if (totalGuests !== undefined) {
  const guestsNum = parseInt(totalGuests, 10);
  if (isNaN(guestsNum)) {
    return res.status(400).json({ success: false, message: "Invalid totalGuests value" });
  }
  reservation.totalGuests = guestsNum;
}


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

    if (reservation.addedWith !== req.user.email)
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
    console.log("Fetching reservations for roomId:", req.params);
    const reservations = await Reservation.findAll({
      where: { roomId: req.params.id },
      include: { model: Room, include: { model: RoomType, include: {
        model: RoomAmenity,
        as: "amenities"
      } } }
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
