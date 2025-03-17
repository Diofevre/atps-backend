const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const ExamUser = sequelize.define('ExamUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_answer: {
    type: DataTypes.STRING,
    defaultValue:null,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue:null,
  },
}, {
  tableName: 'exam_users',
  timestamps: true, 
  paranoid: true, 
});



module.exports = ExamUser;
