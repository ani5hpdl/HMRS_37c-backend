const Reservation = require("../models/reservationModel");
const { Op } = require("sequelize");

const createReservation = async(req,res) => {
    try {
        const {
            roomId,
            specialRequest,
            checkInDate,
            checkOutDate,
            totalGuests,
            totalPrice
        } = req.body;

        if(!roomId || !checkInDate || !checkOutDate || !totalGuests || !totalPrice){
            return res.status(400).json({
                success :  false,
                message : "All Fields are Required!"
            });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

         if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date"
            });
        }

        const existingReservation = await Reservation.findOne({
            where: {
                roomId,
                [Op.and]: [
                { checkInDate: { [Op.lt]: checkOut } },
                { checkOutDate: { [Op.gt]: checkIn } }
                ]
            }
            });

            if (existingReservation) {
            return res.status(409).json({
                success: false,
                message: "Room is already reserved for the selected dates"
            });
        }

        const nights =
        Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        const newReservation = await Reservation.create({
            guestName : req.user.name,
            guestEmail : req.user.email,
            roomId,
            specialRequest,
            checkInDate,
            checkOutDate,
            nights,
            totalGuests,
            totalPrice 
        });

        return res.status(201).json({
            success : true,
            message : "Reservation made Sucessfully!!",
            data : newReservation
        });


    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error while doing reservation",
            error : error.message
        });
    }
}

const getallReservations = async(req,res) => {
    try{
        const reservations = await Reservation.findAll();

        if (!reservations) {
            return res.status(404).json({
                success: false,
                message: "Reservations not found",
            });
        }

        return res.status(200).json({
            success: true,
            message : "All Reservation Fetched",
            data: reservations
        });

    }catch(error){
        return res.status(500).json({
            success :  false,
            message : "Error while Fetching Data",
            error : error.message
        });
    }
}

const getMyReservations = async(req,res) => {
    try{
        const reservations = await Reservation.findAll({where : {guestEmail : req.user.email}});

       if (reservations.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No reservations found",
            data: []
        });
        }   


        return res.status(200).json({
            success: true,
            message : "All Reservation Fetched",
            data: reservations
        });

    }catch(error){
        return res.status(500).json({
            success :  false,
            message : "Error while Fetching Data",
            error : error.message
        });
    }
}

const getReservationsById = async(req,res) => {
    try{
        const reservation = await Reservation.findByPk(req.params.id);

        if (reservations.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No reservations found",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message : "Reservation Fetched",
            data: reservation
        });

    }catch(error){
        return res.status(500).json({
            success :  false,
            message : "Error while Fetching Data",
            error : error.message
        });
    }
}

const updateReservation = async(req,res) => {
    try {
    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservations not found",
      });
    }

    const {status,paymentStatus} = req.body;

    await reservation.update({
        status : status || reservation.status,
        paymentStatus : paymentStatus || reservation.paymentStatus
    });

    return res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      data: reservation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update Reservation",
      error: error.message,
    });
  }
}

const updateMyReservations = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      checkInDate,
      checkOutDate,
      specialRequest,
      totalGuests,
      totalPrice
    } = req.body;

    // Find reservation
    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Ownership check
    if (reservation.guestEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this reservation",
      });
    }

    // Date validation (only if dates are provided)
    if (checkInDate || checkOutDate) {
      const newCheckIn = new Date(checkInDate || reservation.checkInDate);
      const newCheckOut = new Date(checkOutDate || reservation.checkOutDate);

      if (newCheckOut <= newCheckIn) {
        return res.status(400).json({
          success: false,
          message: "Check-out date must be after check-in date",
        });
      }

      // Check for overlapping reservations (exclude current reservation)
      const conflict = await Reservation.findOne({
        where: {
          roomId: reservation.roomId,
          id: { [Op.ne]: reservation.id },
          [Op.and]: [
            { checkInDate: { [Op.lt]: newCheckOut } },
            { checkOutDate: { [Op.gt]: newCheckIn } }
          ]
        }
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Room is already reserved for the selected dates",
        });
      }

      // Recalculate nights
      reservation.nights = Math.ceil(
        (newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24)
      );

      reservation.checkInDate = newCheckIn;
      reservation.checkOutDate = newCheckOut;
    }

    // Update allowed fields
    if (specialRequest !== undefined) reservation.specialRequest = specialRequest;
    if (totalGuests !== undefined) reservation.totalGuests = totalGuests;
    if (totalPrice !== undefined) reservation.totalPrice = totalPrice;

    await reservation.save();

    return res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      data: reservation,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update reservation",
      error: error.message,
    });
  }
};

const cancelMyReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    if (reservation.guestEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    reservation.status = "CANCELLED";
    await reservation.save();

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      data: reservation
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel reservation",
      error: error.message
    });
  }
};


const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    await reservation.destroy();

    return res.status(200).json({
      success: true,
      message: "Reservation deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete reservation",
      error: error.message
    });
  }
};

const getReservationsByRoom = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { roomId: req.params.roomId }
    });

    return res.status(200).json({
      success: true,
      data: reservations
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


module.exports = {
    createReservation,getallReservations,getMyReservations,getReservationsById,updateReservation,updateMyReservations,cancelMyReservation,deleteReservation,getReservationsByRoom
}