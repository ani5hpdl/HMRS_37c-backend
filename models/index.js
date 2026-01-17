const Room = require("./roomModel");
const RoomType = require("./roomTypeModel");
const RoomAmenity = require("./roomAmenityModel");

Room.belongsTo(RoomType, { foreignKey: "roomTypeId" });
RoomType.hasMany(Room, { foreignKey: "roomTypeId" });

RoomType.hasOne(RoomAmenity, { foreignKey: "roomTypeId" });
RoomAmenity.belongsTo(RoomType, { foreignKey: "roomTypeId" });

module.exports = {
  Room,
  RoomType,
  RoomAmenity,
};
