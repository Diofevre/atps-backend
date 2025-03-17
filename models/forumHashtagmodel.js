const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Hashtag = sequelize.define('Hashtag', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    }
}, {
    tableName: 'forum_hashtags',
    timestamps: false, // Pas de createdAt et updatedAt
    paranoid: false, // Pas de deletedAt
});

module.exports = Hashtag;
