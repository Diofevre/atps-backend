const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Chapter = sequelize.define('Chapter', {
    chapter_text: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    topic_id: {
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
  
}, {
    tableName: 'chapters',
    timestamps: false, 
});



module.exports = Chapter;
