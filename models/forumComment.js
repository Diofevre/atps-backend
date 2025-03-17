const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const ForumComment = sequelize.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
       
    },
    user_id: {
        type: DataTypes.STRING(191),
        allowNull: false,
        references: {
            model: User,
            key: 'clerkId',  
        },
        onDelete: 'CASCADE',
    },
    parent_comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'forum_comments', // Auto-référence pour gérer les réponses aux commentaires
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'forum_comments',
    timestamps: true, // Active automatiquement createdAt et updatedAt
});

module.exports = ForumComment;
