const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./userModel');

const Reaction = sequelize.define(
  "Reaction",
  {
    id: { 
        type: DataTypes.INTEGER, primaryKey: true, 
        autoIncrement: true 
    },
    type: {
      type: DataTypes.ENUM("like", "dislike"),
      defaultValue: null, 
    },
    user_id: {
      type: DataTypes.STRING(191),
      allowNull: false,
      collate: 'utf8mb4_unicode_ci',
      references: {
        model: User,
        key: "clerkId",
      },
    },
    comment_id: {
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
    },
  },
  {
    tableName: "Reactions",
    timestamps: false, 
  }
);





module.exports = Reaction;
