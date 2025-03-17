const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ArticleSection = sequelize.define(
  "ArticleSection",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
    heading: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    section_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    section_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  },
  {
    tableName: "articles_sections",
    timestamps: false,
  }
);



module.exports = ArticleSection;
