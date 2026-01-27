const { getAllRooms, createRooms, getRoomById, updateRoom, deactivateRoom, deleteRoom, getAvailableRooms } = require("../controllers/roomController");
const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");

const express = require("express").Router();

express.post("/createRooms",authMiddleware,isAdmin,createRooms);
express.get("/getAllRooms",authMiddleware,getAllRooms);
express.get("/getRoom/:id",authMiddleware,getRoomById);
express.put("/updateRoom/:id",authMiddleware,isAdmin,updateRoom);
express.patch("/:id/deactivate",authMiddleware,isAdmin,deactivateRoom);
express.delete("/delete/:id",authMiddleware,isAdmin,deleteRoom);
express.get("/available",authMiddleware,getAvailableRooms);

module.exports=express;