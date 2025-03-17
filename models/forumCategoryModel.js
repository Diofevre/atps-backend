const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ForumCategory = sequelize.define('ForumCategory', {
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
    tableName: 'forum_categories',
    timestamps: false, 
});

module.exports = ForumCategory;
