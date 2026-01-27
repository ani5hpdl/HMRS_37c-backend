const { Reservation, Room, RoomType } = require("../models");
const Payment = require("../models/paymentModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session (redirects to Stripe's page)
const createStripeCheckout = async(req, res) => {
    const { reservationId, amount } = req.body;

    if(!reservationId || !amount) {
        return res.status(400).json({
            success: false,
            message: "Reservation ID and Amount are required!"
        });
    }

    try {
        // Create payment record first
        const newPayment = await Payment.create({
            reservationId,
            userId: req.user.id,
            amount,
            isPartial: false,
            currency: 'USD',
            paymentMethod: 'card',
            paymentGatewayRef: 'pending',
            status: 'initiated',
            remarks: 'Stripe Checkout Initiated'
        });

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Hotel Reservation',
                            description: `Booking ID: ${reservationId}`,
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}&reservationId=${reservationId}`,
            cancel_url: `http://localhost:5173/payment-cancel?reservationId=${reservationId}`,
            metadata: {
                reservationId: reservationId,
                userId: req.user.id.toString(),
                paymentId: newPayment.id
            }
        });

        // Update payment with session ID
        await newPayment.update({
            paymentGatewayRef: session.id
        });

        return res.status(200).json({
            success: true,
            message: "Checkout session created!",
            data: {
                sessionId: session.id,
                checkoutUrl: session.url // Stripe's hosted checkout URL
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating checkout session!",
            error: error.message
        });
    }
}

// Verify Payment after redirect back
const verifyStripePayment = async(req, res) => {
    const { session_id } = req.query;

    if(!session_id) {
        return res.status(400).json({
            success: false,
            message: "Session ID is required!"
        });
    }

    try {
        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Find payment in database
        const payment = await Payment.findOne({
            where: { paymentGatewayRef: session_id }
        });

        if(!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found!"
            });
        }

        // Update payment status
        if(session.payment_status === 'paid') {
            await payment.update({
                status: 'successful',
                paidAt: new Date(),
                remarks: 'Payment Completed via Stripe Checkout'
            });

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully!",
                data: payment
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment not completed!"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error verifying payment!",
            error: error.message
        });
    }
}

module.exports = {
    createStripeCheckout,
    verifyStripePayment
}