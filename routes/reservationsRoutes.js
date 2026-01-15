const { createReservation, getMyReservations, getReservationsById, updateMyReservations, cancelMyReservation, getallReservations, updateReservation, deleteReservation, getReservationsByRoom } = require("../controllers/reservationController");
const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");

const express = require("express").Router();

// Create a reservation
router.post("/reservations", authMiddleware, createReservation);

// Get my reservations
router.get("/reservations/me", authMiddleware, getMyReservations);

// Get reservation by ID (my own or admin access)
router.get("/reservations/:id", authMiddleware, getReservationsById);

// Update my reservation
router.put("/reservations/me/:id", authMiddleware, updateMyReservations);

// Cancel my reservation
router.patch("/reservations/me/:id/cancel", authMiddleware, cancelMyReservation);

// Get all reservations
router.get("/admin/reservations", authMiddleware, isAdmin, getallReservations);

// Update reservation status/payment
router.put("/admin/reservations/:id", authMiddleware, isAdmin, updateReservation);

// Delete reservation
router.delete("/admin/reservations/:id", authMiddleware, isAdmin, deleteReservation);

// Get reservations by room
router.get("/admin/reservations/room/:id", authMiddleware, isAdmin, getReservationsByRoom);


module.exports=express;