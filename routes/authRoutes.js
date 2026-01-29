const { register, login, logout, verifyEmail, getMe, forgetPassword, verifyResetPassword } = require("../controllers/authController");
const authMiddleware = require("../helpers/authMiddleware");

const express = require("express").Router();

express.post("/register",register);
express.post("/login",login);
express.get("/logout",logout);
express.get("/verify",verifyEmail);
express.post("/forgetPassword",forgetPassword);
express.put("/resetpassword",verifyResetPassword);
express.get("/me",authMiddleware,getMe);

module.exports=express;