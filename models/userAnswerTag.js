const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");


const UserAnswerTag = sequelize.define(
  "UserAnswerTag",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_answer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
  },
  {
    tableName: "user_answer_tags",
    timestamps: false,
  }
);


module.exports = UserAnswerTag;
