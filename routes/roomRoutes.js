const { getAllRooms, createRooms, getRoomById, updateRoom, deactivateRoom, deleteRoom } = require("../controllers/roomController");

const express = require("express").Router();

express.post("/createRooms",createRooms);
express.get("/getAllRooms",getAllRooms);
express.get("/getRoom/:id",getRoomById);
express.put("/updateRoom/:id",updateRoom);
express.patch("/:id/deactivate",deactivateRoom);
express.delete("/delete/:id",deleteRoom);

module.exports=express;