const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
 
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    allowNull: false,
    collate: 'utf8mb4_unicode_ci',
  },
  clerkId: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
    collate: 'utf8mb4_unicode_ci',
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
    collate: 'utf8mb4_unicode_ci',
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: true,
    collate: 'utf8mb4_unicode_ci',
  },
  username: {
    type: DataTypes.STRING(191),
    allowNull: true,
    collate: 'utf8mb4_unicode_ci',
  },
  picture: {
    type: DataTypes.STRING(255),
    allowNull: true,
    collate: 'utf8mb4_unicode_ci',
  },
  role: {
    type: DataTypes.ENUM('admin', 'client'), // Role est soit admin, soit client
    allowNull: false, // Cette colonne ne doit pas être null
    defaultValue: 'client', // Valeur par défaut si aucun rôle n'est spécifié
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  language:{
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  stripe_customer_id:{
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  trial_start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, 
    allowNull: true,
  },
  trial_end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscription_status: {
    type: DataTypes.ENUM('trial', 'expired', 'standard','premium', 'past_due', 'canceling'),
    allowNull: true, 
    defaultValue: 'trial',
  },
  subscription_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  subscription_plan: {
    type: DataTypes.STRING, // "standard" ou "premium"
    allowNull: false,
  },
  billing_cycle: {
    type: DataTypes.INTEGER, // Durée en mois (1, 3, 6, 12)
    allowNull: false,
  },
  price_per_month: {
    type: DataTypes.FLOAT, // Stocke le prix pour référence
    allowNull: false,
  },
  suspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
  
}, {
  tableName: 'users',
  timestamps: true, // Sequelize utilisera createdAt et updatedAt
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
});

module.exports = User;
