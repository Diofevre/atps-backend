const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SupportTicket = sequelize.define("SupportTicket", {
  id: {
    type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("open", "pending", "closed"),
    defaultValue: "open",
  },
},
{
    tableName: "SupportTicket",
    timestamps: true,
});

module.exports = SupportTicket;
