const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./userModel');

const Comment = sequelize.define(
  "Comment",
  {
    id: { 
        type: DataTypes.INTEGER, primaryKey: true, 
        autoIncrement: true 
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "Comments",
    timestamps: false,
  }
);

// Définir la relation entre Comment et Question


module.exports = Comment;
