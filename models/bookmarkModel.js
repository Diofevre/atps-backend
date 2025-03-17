const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  page_id: {
    type: DataTypes.INTEGER,
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
  bookmarked: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  tableName: 'bookmarks',
  timestamps: true,
});

module.exports = Bookmark;
