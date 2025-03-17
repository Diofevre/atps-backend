const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const Question = sequelize.define(
  "Question",
  {
    question_text: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    countries: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    explanation_images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    question_images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    quality_score: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sub_chapter_id: {
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
   
  },
  {
    tableName: "questions",
    timestamps: false, 
  }
);


module.exports = Question;
