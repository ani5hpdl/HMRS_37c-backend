<<<<<<< HEAD
const { register, login, logout, verifyEmail } = require("../controllers/authController");

const express = require("express").Router();

express.post("/register",register);
express.post("/login",login);
express.get("/logout",logout);
express.get("/verify",verifyEmail);

=======
const { register, login, logout, verifyEmail, getMe } = require("../controllers/authController");
const authMiddleware = require("../helpers/authMiddleware");

const express = require("express").Router();

express.post("/register",register);
express.post("/login",login);
express.get("/logout",logout);
express.get("/verify",verifyEmail);
express.get("/me",authMiddleware,getMe);

>>>>>>> 7f4587045fc30d2965fbe25f29cabe696c7fa674
module.exports=express;