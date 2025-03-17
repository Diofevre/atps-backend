const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Dictionary = sequelize.define(
  "Dictionary",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    word: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url:{
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "dictionary",
    timestamps: false
  }
);

module.exports = Dictionary;
