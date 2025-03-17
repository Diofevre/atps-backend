const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatbotLesson = sequelize.define('ChatbotLesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userQuestion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  aiResponse: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  relevantExplanations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Temps de réponse en millisecondes',
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Status de la réponse (succès, échec, etc.)',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Message d\'erreur si la réponse échoue',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'chatbot_lessons',
  timestamps: false, 
});

module.exports = ChatbotLesson;
