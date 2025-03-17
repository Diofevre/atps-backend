const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'tags',
    timestamps: false,
  });
  
  module.exports = Tag;
  