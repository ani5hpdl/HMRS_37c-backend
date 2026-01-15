const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/Database");

const Reservation = sequelize.define(
  "Reservation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    guestName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    guestEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "rooms",
        key: "id",
      },
    },

    specialRequest: {
      type: DataTypes.TEXT,
      allowNull: true, // Late check-out, extra pillows, etc.
    },

    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    checkOutDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    nights: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    totalGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled"
      ),
      defaultValue: "pending",
    },

    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "paid", "refunded"),
      defaultValue: "unpaid",
    },

    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "reservations",
    timestamps: true,
  }
);

module.exports = Reservation;
