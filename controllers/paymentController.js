const { Reservation, Room, RoomType, RoomAmenity } = require("../models");
const Payment = require("../models/paymentModel");

const createPayment = async(req,res) => {
    const {reservationId, amount, isPartial, currency, paymentMethod, paymentGatewayRef, status, remarks} = req.body;

    if(!reservationId || !amount || !currency || !paymentMethod || !paymentGatewayRef || !remarks){
        return res.status(400).json({
            success : false,
            message : "All Fields are Required!!"
        });
    }

    try {
        const newPayment = await Payment.create({
            reservationId,
            userId : req.user.id,
            amount,
            isPartial,
            currency,
            paymentMethod,
            paymentGatewayRef,
            status,
            remarks
        });

        return res.status(201).json({
            success : true,
            message : "Payment has been Sucessfully Added!",
            data : newPayment
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error while doing Payments!",
            error : error.message
        });
    }
}

const getAllPayments = async(req,res) => {
    try {
        const allPayments =await Payment.findAll({
            include : {model: Reservation,include: [{ model: Room, include: [{ model: RoomType, include: [RoomAmenity] }] }]}
        });

        return res.status(200).json({
            success : true,
            message : "All Payments are Fetched Sucessfully!",
            data : allPayments
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Failed to Fetch Payments!",
            error : error.message
        });
    }
}

const getPaymentsById = async(req,res) => {
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({
                success : false,
                message : "Invalid Try!!"
            });
        }

        const fetchPayment =await Payment.findByPk({id,
            include : {model: Reservation,include: [{ model: Room, include: [{ model: RoomType, include: [RoomAmenity] }] }]}           
        });

        return res.status(200).json({
            success : true,
            message : "All Payments are Fetched Sucessfully!",
            data : fetchPayment
        });

    }catch(error){

        return res.status(500).json({
            success : false,
            message : "Failed to Fetch Payments!",
            error : error.message
        });
    }
}

const getMyPayments = async(req,res) => {
    try{
        const fetchPayment =await Payment.findOne({where : {userId : req.user.id},
            include : {model: Reservation,include: [{ model: Room, include: [{ model: RoomType, include: [RoomAmenity] }] }]}           
        });

        return res.status(200).json({
            success : true,
            message : "All Payments are Fetched Sucessfully!",
            data : fetchPayment
        });
    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to Fetch Payments",
            error : error.message
        });
    }
}

const updatePayments = async(req,res) => {
    try{
        const {id} = req.params.id;
        if(!id){
            return res.status(400).json({
                success : true,
                message : "Invalid Try"
            });
        }
        const {reservationId, amount, isPartial, currency, paymentMethod, paymentGatewayRef, status, refundAmount, remarks} = req.body;
        if(refundAmount){
            const refundedAt = new Date();
        }

        const fetchedPayment = await Payment.findByPk(id);
        await fetchedPayment.update({
            reservationId : reservationId || fetchedPayment.reservationId,
            amount : amount || fetchedPayment.amount,
            isPartial : isPartial || fetchedPayment.isPartial,
            currency : currency || fetchedPayment.currency,
            paymentMethod : paymentMethod || fetchedPayment.paymentMethod,
            paymentGatewayRef : paymentGatewayRef || fetchedPayment.paymentGatewayRef,
            status : status || fetchedPayment.status,
            refundAmount : refundAmount || fetchedPayment.refundAmount,
            refundedAt : refundedAt || fetchedPayment.refundedAt,
            remarks : remarks || fetchedPayment.remarks
        });

        return res.status(200).json({
            success : true,
            message : "Payment Updated Sucessfully",
            data : fetchedPayment
        });
    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Failed to Update Payments",
            error : error.message
        });
    }
}

module.exports = {createPayment,getAllPayments,getPaymentsById,getMyPayments,updatePayments}