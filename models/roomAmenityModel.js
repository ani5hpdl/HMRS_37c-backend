const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/Database");

const RoomAmenity = sequelize.define(
  "RoomAmenity",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    roomTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    wifi: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    airConditioning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    flatScreenTV: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    miniFridge: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    coffeeTeaMaker: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    ensuiteBathroom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    bathtub: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasBalcony: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasWorkDesk: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "room_amenities",
    timestamps: false,
  }
);

module.exports = RoomAmenity;