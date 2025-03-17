const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    pool: {
        max: 10, // Nombre max de connexions en pool (augmente si nécessaire)
        min: 0, // Nombre min de connexions (0 signifie aucune connexion inactive permanente)
        acquire: 60000, // Temps max pour acquérir une connexion (60 secondes)
        idle: 10000, // Temps avant qu'une connexion inactive soit libérée (10 secondes)
      },
      retry: {
        max: 3, // Nombre de tentatives en cas d'échec de connexion
      },
});

module.exports = sequelize;