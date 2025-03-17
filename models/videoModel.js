const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Video = sequelize.define('Video', {
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    youtube_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    duration: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    thumbnail_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
       
    },
    channel_id: {
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
    tableName: 'videos',
    timestamps: false, // On désactive les timestamps automatiques
});

module.exports = Video;
