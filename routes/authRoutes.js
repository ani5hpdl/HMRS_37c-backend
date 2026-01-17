const { register, login, logout, verifyEmail, forgotPassword } = require("../controllers/authController");

const express = require("express").Router();

express.post("/register",register);
express.post("/login",login);
express.get("/logout",logout);
express.get("/verify",verifyEmail);
express.post("/forgot-password", forgotPassword);

module.exports=express;