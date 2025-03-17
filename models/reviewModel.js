const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./userModel');

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    country_seen: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    information: {
      type: DataTypes.TEXT,
    },
    info_accuracy: {
      type: DataTypes.INTEGER,
    },
    seen:{
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
  },
  {
    tableName: "Review",
    timestamps: false,
    collate: "utf8mb4_unicode_ci", 
    paranoid: true, 
  }
);


module.exports = Review;
