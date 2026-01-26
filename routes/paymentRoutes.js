const { createPayment, getAllPayments, getPaymentsById, getMyPayments, updatePayments } = require("../controllers/paymentController");
const authMiddleware = require("../helpers/authMiddleware");
const isAdmin = require("../helpers/isAdmin");

const express = require("express").Router();

express.post("/createPayments",authMiddleware,isAdmin,createPayment);
express.get("/getallPayments",authMiddleware,isAdmin,getAllPayments);
express.get("/getPayments/:id",authMiddleware,isAdmin,getPaymentsById);
express.get("/getMyPayments/:id",authMiddleware,getMyPayments);
express.post("/updatePayments/:id",authMiddleware,isAdmin,updatePayments);

module.exports=express;