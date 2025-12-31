const { createUser, getUserById, getAllUsers, updateUser, deleteUser } = require("../controllers/userController");
const express = require("express").Router();

express.post("/createUser",createUser);
express.get("/getUserById/:id",getUserById);
express.get("/getAllUsers",getAllUsers);
express.post("/updateUserById/:uid",updateUser);
express.get("/deleteUser/:did",deleteUser);

module.exports=express;