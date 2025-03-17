const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Article = sequelize.define(
  "Article",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    title_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    title_text: {
      type: DataTypes.TEXT,
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
    tableName: "articles",
    timestamps: false,
  }
);

module.exports = Article;
