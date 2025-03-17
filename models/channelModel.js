const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Channel = sequelize.define('Channel', {
    channel_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    channel_profile_image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    genre: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    language: {
        type: DataTypes.STRING(100),
        allowNull: true,
    }
}, {
    tableName: 'channels',
    timestamps: false, // On désactive les timestamps automatiques
});

module.exports = Channel;
