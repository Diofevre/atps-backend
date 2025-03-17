const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Cours = sequelize.define(
  "Cours",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    topic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nom_dossier_s3: {
      type: DataTypes.STRING(255),
      allowNull: false,
    }
  },
  {
    tableName: "cours",
    timestamps: false,
  }
);

module.exports = Cours;
