const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./userModel');

const UserAnswer = sequelize.define(
  "UserAnswer",
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
    testSubChapter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
    user_answer: {
      type: DataTypes.STRING,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
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
    tableName: "user_answers",
    timestamps: false,
    paranoid: true, 
  }
);

module.exports = UserAnswer;
