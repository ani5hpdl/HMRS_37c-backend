const Room = require("../models/roomModel");

const createRooms = async(req,res) => {
    const {name,description,bedType,pricePerNight,hasBalcony,hasWorkDesk,viewType,wifi,airConditioning,flatScreenTV,miniFridge,coffeeTeaMaker,ensuiteBathroom,bathtub} = req.body;
    if(!name || !description || !bedType || !pricePerNight || !hasBalcony || !viewType){
        return res.status(400).json({
            success : false,
            message : "All Fields are Required"
        });
    }

    let roomSize;
    let maxGuests;
    if(name == "Junior Suite"){
        roomSize = 36
        maxGuests = 4
    }else if(name == "Executive Suite"){
        roomSize = 42
        maxGuests = 4
    }else{
        roomSize = 28
        maxGuests = 2
    }

    try {
        const newRoom = await Room.create({
            name,
            description,
            roomSize,
            bedType,
            maxGuests,
            pricePerNight,
            hasBalcony,
            hasWorkDesk,
            viewType,
            wifi,
            airConditioning,
            flatScreenTV,
            miniFridge,
            coffeeTeaMaker,
            ensuiteBathroom,
            bathtub
        });

        return res.status(201).json({
            success :  true,
            message : "Room Created Sucessfully!!",
            data : {newRoom}
        });

    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error While adding Rooms",
            error : error.message
        });
    }
}

const getAllRooms = async (req, res) => {
  try {
    const { isActive, maxGuests, viewType } = req.query;

    const whereClause = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    if (maxGuests) {
      whereClause.maxGuests = maxGuests;
    }

    if (viewType) {
      whereClause.viewType = viewType;
    }

    const rooms = await Room.findAll({ where: whereClause });

    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await room.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message,
    });
  }
};

const deactivateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    room.isActive = false;
    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate room",
      error: error.message,
    });
  }
}; 

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await room.destroy();

    return res.status(200).json({
      success: true,
      message: "Room deleted permanently",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, maxGuests, viewType } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "checkInDate and checkOutDate are required",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "checkOutDate must be after checkInDate",
      });
    }

    // Step 1: Find rooms that have conflicting reservations
    const bookedRooms = await Reservation.findAll({
      attributes: ["roomId"],
      where: {
        [Op.and]: [
          { checkInDate: { [Op.lt]: checkOut } },
          { checkOutDate: { [Op.gt]: checkIn } },
        ],
      },
    });

    const bookedRoomIds = bookedRooms.map((r) => r.roomId);

    // Step 2: Find all rooms that are active and not booked
    const whereClause = {
      isActive: true,
      id: { [Op.notIn]: bookedRoomIds },
    };

    if (maxGuests) whereClause.maxGuests = { [Op.gte]: maxGuests };
    if (viewType) whereClause.viewType = viewType;

    const availableRooms = await Room.findAll({
      where: whereClause,
    });

    return res.status(200).json({
      success: true,
      message: "Available rooms fetched successfully",
      data: availableRooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available rooms",
      error: error.message,
    });
  }
};

module.exports = {
    createRooms,
    getAllRooms,
    getRoomById,
    updateRoom,
    deactivateRoom,
    deleteRoom,
    getAvailableRooms
}