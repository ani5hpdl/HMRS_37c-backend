const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/Database");

const RoomType = sequelize.define(
  "RoomType",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.ENUM(
        "Deluxe Room",
        "Super Deluxe Room",
        "Junior Suite",
        "Executive Suite"
      ),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    roomSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    bedType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    viewType: {
      type: DataTypes.ENUM("city", "garden", "sea", "none"),
      defaultValue: "none",
    },

    pricePerNight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "room_types",
    timestamps: false,
  }
);

module.exports = RoomType;
