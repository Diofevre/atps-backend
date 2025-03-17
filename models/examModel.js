const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  topic_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
   
  },
  user_id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    allowNull: false,
    collate: "utf8mb4_unicode_ci",
    references: {
      model: User,
      key: "clerkId",
    },
   
  },
  number_of_questions: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }, 
  exam_duration: {
    type: DataTypes.TIME, 
    allowNull: false,
  },
  is_finished:{
    type: DataTypes.BOOLEAN,
    defaultValue: null,
  },
  timespent: {
    type: DataTypes.TIME,
  },
  score: {
    type: DataTypes.FLOAT,
  },
  finished_question: {
    type: DataTypes.INTEGER,
  },
 
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'exams',
  timestamps: true, 
  paranoid: true, 
});


module.exports = Exam;
