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

    name: {
      type: DataTypes.ENUM("Deluxe Room", "Super Deluxe Room", "Junior Suite", "Executive Suite"),
      allowNull: false, // e.g. "Deluxe Room"
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    roomSize: {
      type: DataTypes.INTEGER,
      allowNull: true, // square meters (e.g. 35)
    },

    bedType: {
      type: DataTypes.STRING(50),
      allowNull: false, // e.g. "King Size"
    },

    maxGuests: {
      type: DataTypes.INTEGER,
      allowNull: false, // e.g. 2
    },

    pricePerNight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    hasBalcony: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hasWorkDesk: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    viewType: {
      type: DataTypes.ENUM("city", "garden", "sea", "none"),
      defaultValue: "none",
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