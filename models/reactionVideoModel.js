const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const ReactionVideo = sequelize.define('ReactionVideo', {
    id: { 
        type: DataTypes.INTEGER, primaryKey: true, 
        autoIncrement: true 
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      collate: 'utf8mb4_unicode_ci',
      references: {
        model: User,
        key: "clerkId",
      },
    },
    video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        
    },
    reaction_type: {
        type: DataTypes.STRING(10), // Peut être 'like' ou 'dislike'
        allowNull: true,
        validate: {
            isIn: [['like', 'dislike']], // Valide uniquement 'like' ou 'dislike'
        },
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
    tableName: 'reactions_videos',
    timestamps: false, // Désactiver les timestamps automatiques
});

module.exports = ReactionVideo;
