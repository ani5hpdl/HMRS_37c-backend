const Room = require("./roomModel");
const RoomType = require("./roomTypeModel");
const RoomAmenity = require("./roomAmenityModel");
const Reservation = require("./reservationModel"); // <-- Added Reservation
const Payment = require("./paymentModel");

// Room ↔ RoomType
Room.belongsTo(RoomType, { foreignKey: "roomTypeId" });
RoomType.hasMany(Room, { foreignKey: "roomTypeId" });

// RoomType ↔ RoomAmenity
RoomType.hasOne(RoomAmenity, { foreignKey: "roomTypeId" , as: 'amenities' });
RoomAmenity.belongsTo(RoomType, { foreignKey: "roomTypeId", as: 'roomType' });

// Room ↔ Reservation
Reservation.belongsTo(Room, { foreignKey: "roomId" });
Room.hasMany(Reservation, { foreignKey: "roomId" });

// Payment ↔ Reservation
Reservation.hasMany(Payment, {  foreignKey: "reservationId",});
Payment.belongsTo(Reservation, {foreignKey: "reservationId",});


module.exports = {
  Room,
  RoomType,
  RoomAmenity,
  Reservation, 
};
