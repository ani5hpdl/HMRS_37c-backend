const { createReservation, getMyReservations, getReservationById, updateMyReservation, cancelMyReservation, getAllReservations, updateReservation, deleteReservation, getReservationsByRoom } = require("../controllers/reservationController");
const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");

const express = require("express").Router();

// Create a reservation
express.post("/reservations", authMiddleware, createReservation);

// Get my reservations
express.get("/reservations/me", authMiddleware, getMyReservations);

// Get reservation by ID (my own or admin access)
express.get("/reservations/:id", authMiddleware, getReservationById);

// Update my reservation
express.put("/reservations/me/:id", authMiddleware, updateMyReservation);

// Cancel my reservation
express.patch("/reservations/me/:id/cancel", authMiddleware, cancelMyReservation);

// Get all reservations
express.get("/admin/reservations", authMiddleware, isAdmin, getAllReservations);

// Update reservation status/payment
express.put("/admin/reservations/:id", authMiddleware, isAdmin, updateReservation);

// Delete reservation
express.delete("/admin/reservations/:id", authMiddleware, isAdmin, deleteReservation);

// Get reservations by room
express.get("/admin/reservations/room/:id", authMiddleware, isAdmin, getReservationsByRoom);


module.exports=express;