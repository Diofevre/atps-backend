const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./userModel');

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.STRING(191),
      allowNull: false,
      collate: 'utf8mb4_unicode_ci',
      references: {
        model: User,
        key: "clerkId",
      },
    }, 
    categorie: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    seen:{
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  },
  {
    tableName: "reports",
    timestamps: false,
    collate: "utf8mb4_unicode_ci", 
    paranoid: true // Sequelize gère automatiquement deleted_at pour le soft delete
  }
);


  

module.exports = Report;
