const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Exam = require('./examModel');

const Topic = sequelize.define('Topic', {
    topic_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    exam_number_question:{
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    exam_duration: {
        type: DataTypes.TIME,
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
   
}, {
    tableName: 'topics',
    timestamps: false, 
});


module.exports = Topic;
