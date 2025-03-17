const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');
const Comment = require('./commentModel');  // Assurez-vous d'importer le modèle de "comments"

const ForumCommentReaction = sequelize.define('ForumCommentReaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    user_id: {
        type: DataTypes.STRING(191),  // Correspond à VARCHAR(191)
        allowNull: false,
        references: {
            model: User,
            key: 'clerkId',
        },
        onDelete: 'CASCADE',
    },
    reaction_type: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false,
    },
}, {
    tableName: 'forum_comment_reactions',
    timestamps: true,  // Ajoute createdAt et updatedAt
});

module.exports = ForumCommentReaction;
