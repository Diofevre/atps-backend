const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./userModel');


const Test = sequelize.define(
  "Test",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING(191),
      primaryKey: true,
      allowNull: false,
      collate: "utf8mb4_unicode_ci",
      references: {
        model: User,
        key: "clerkId",
      },
      
    },
    is_finished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    timespent: {
      type: DataTypes.TIME,
    },
    score: {
      type: DataTypes.FLOAT,
    },
    total_question: {
      type: DataTypes.INTEGER,
    },
    finished_question: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: "test",
    timestamps: false,
  }
);



module.exports = Test;
