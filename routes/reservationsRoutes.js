const { createReservation, getMyReservations, getReservationsById, updateMyReservations, cancelMyReservation, getallReservations, updateReservation, deleteReservation, getReservationsByRoom } = require("../controllers/reservationController");
const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");

const express = require("express").Router();

express.post("/createReservations",authMiddleware,createReservation);
express.post("/getMyReservations",authMiddleware,getMyReservations);
express.post("/getReservationsById/:id",authMiddleware,getReservationsById);
express.post("/updateMyReservations/:id",authMiddleware,updateMyReservations);
express.post("/cancelMyReservation/:id",authMiddleware,cancelMyReservation);

express.post("/getallReservations",authMiddleware,isAdmin,getallReservations);
express.post("/updateReservation/:id",authMiddleware,isAdmin,updateReservation);
express.post("/deleteReservation/:id",authMiddleware,isAdmin,deleteReservation);
express.post("/getReservationsByRoom/:id",authMiddleware,isAdmin,getReservationsByRoom);


module.exports=express;