const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const ForumPost = sequelize.define('ForumPost', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.STRING(191),
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    category_id: {
        type: DataTypes.INTEGER,
        
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'forum_posts',
    timestamps: true, // Active createdAt et updatedAt automatiquement
});

module.exports = ForumPost;
