const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubChapter = sequelize.define('SubChapter', {
    sub_chapter_text: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    chapter_id: {
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

    }
}, {
    tableName: 'sub_chapters',
    timestamps: false,  
});



module.exports = SubChapter;
