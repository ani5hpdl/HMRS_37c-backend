const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/Database");

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    roomTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    maxGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "rooms",
    timestamps: true,
  }
);

module.exports = Room;