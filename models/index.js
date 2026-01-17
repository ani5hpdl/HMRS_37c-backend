const Room = require("./roomModel");
const RoomType = require("./roomTypeModel");
const RoomAmenity = require("./roomAmenityModel");
const Reservation = require("./reservationModel"); // <-- Added Reservation

// Room ↔ RoomType
Room.belongsTo(RoomType, { foreignKey: "roomTypeId" });
RoomType.hasMany(Room, { foreignKey: "roomTypeId" });

// RoomType ↔ RoomAmenity
RoomType.hasOne(RoomAmenity, { foreignKey: "roomTypeId" });
RoomAmenity.belongsTo(RoomType, { foreignKey: "roomTypeId" });

// Room ↔ Reservation
Reservation.belongsTo(Room, { foreignKey: "roomId" });
Room.hasMany(Reservation, { foreignKey: "roomId" });

module.exports = {
  Room,
  RoomType,
  RoomAmenity,
  Reservation, 
};
