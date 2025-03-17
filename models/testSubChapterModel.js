const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TestSubChapter = sequelize.define(
  "TestSubChapter",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
    sub_chapter_id: {
      type: DataTypes.JSON,
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
    tableName: "testSubChapter",
    timestamps: false,
    paranoid: true, // Sequelize gère automatiquement deleted_at pour le soft delete
  }
);



module.exports = TestSubChapter;
