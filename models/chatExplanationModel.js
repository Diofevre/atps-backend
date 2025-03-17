const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const ChatExplanation = sequelize.define('ChatExplanation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
  user_id: {
    type: DataTypes.STRING(191),
    allowNull: false,
    collate: 'utf8mb4_unicode_ci',
    onDelete: 'CASCADE',
    references: {
      model: User,
      key: "clerkId",
    },
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true, 
  },
}, {
  tableName: 'chat_explanations', 
  timestamps: false,
});

module.exports = ChatExplanation;
