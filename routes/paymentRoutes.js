const { 
    createStripeCheckout,
    verifyStripePayment
} = require("../controllers/paymentController");
const authMiddleware = require("../helpers/authMiddleware");

const express = require("express");
const router = express.Router();

// Create checkout session and get Stripe URL
router.post("/stripe/create-checkout", authMiddleware, createStripeCheckout);

// Verify payment after user returns from Stripe
router.get("/stripe/verify-payment", authMiddleware, verifyStripePayment);

module.exports = router;