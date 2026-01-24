const { createUser, getUserById, getAllUsers, updateUser, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");
const express = require("express").Router();

express.post("/createUser",authMiddleware,isAdmin,createUser);
express.get("/getUserById/:id",authMiddleware,isAdmin,getUserById);
express.get("/getAllUsers",authMiddleware,isAdmin,getAllUsers);
express.put("/updateUserById/:uid",authMiddleware,isAdmin,updateUser);
express.delete("/deleteUser/:did",authMiddleware,isAdmin,deleteUser);

module.exports=express;