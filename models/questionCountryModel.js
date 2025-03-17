const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const QuestionCountry = sequelize.define('QuestionCountry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
  country_id: {
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
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'question_countries',
  timestamps: false,  
  paranoid: true,  // Sequelize gère automatiquement deleted_at pour le soft delete
});

module.exports = QuestionCountry;
