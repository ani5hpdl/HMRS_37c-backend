const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/Database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    reservationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "reservations",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    isPartial: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // true = advance / partial payment
    },

    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "NPR",
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "cash",
        "card",
        "esewa",
        "khalti",
        "bank_transfer"
      ),
      allowNull: false,
    },

    paymentGatewayRef: {
      type: DataTypes.STRING,
      allowNull: true, // eSewa/Khalti transaction ID
    },

    status: {
      type: DataTypes.ENUM(
        "initiated",
        "successful",
        "failed",
        "refunded"
      ),
      defaultValue: "initiated",
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;