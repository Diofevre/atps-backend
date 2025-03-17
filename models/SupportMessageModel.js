const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SupportMessage = sequelize.define("SupportMessage", {
  id: {
    type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  ticketId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sender: {
    type: DataTypes.ENUM("user", "admin"),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attachment: {
    type: DataTypes.JSON, // Stocke un tableau d'URLs
    allowNull: true,
    defaultValue: [], // Par défaut, pas de fichier attaché
  },
},
{
    tableName: 'SupportMessage',
    timestamps: true,  
});

module.exports = SupportMessage;
