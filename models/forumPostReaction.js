const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const PostReaction = sequelize.define('PostReaction', {
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
        type: DataTypes.INTEGER,
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
    tableName: 'post_reactions',
    timestamps: true,  // Active createdAt et updatedAt
});

module.exports = PostReaction;
