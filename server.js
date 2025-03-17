require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger');
const sequelize = require('./config/db'); 
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes/index');
const { handleClerkWebhook } = require('./controllers/authControlleur');
const subscriptionRoutes = require('./routes/subscriptionRoutes')
const cron = require("node-cron");
const {checkTrialExpiration} = require('./controllers/subscriptionController');


// Initialisation de l'application Express
const app = express();

// Configuration de CORS pour autoriser le frontend
const corsOptions = {
    origin: [process.env.FRONT_URL, process.env.FRONT_URL_2], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true, 
};

// Appliquez CORS à toutes les routes
app.use(cors(corsOptions));

// Sécurisation avec Helmet
app.use(helmet());

// Middleware pour parser le JSON dans les requêtes
//app.use(express.json());

// Utilisation de Swagger UI pour visualiser la documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
    res.send("Welcome");
  });


// Route pour le webhook Clerk
app.post('/clerk-webhook', express.json({ 
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }

}), handleClerkWebhook);

// Utilisation des routes
app.use('/api',express.json(), routes);
app.use('/', bodyParser.raw({ type: 'application/json' }), subscriptionRoutes);


// Exécuter la vérification toutes les heures
cron.schedule("0 * * * *", () => {
  checkTrialExpiration();
});


// Synchronisation avec la base de données (Sequelize)
/*sequelize.sync({ force: false })  // force: true pour réinitialiser les tables, false pour garder les données
    .then(() => {
        console.log("Les tables ont été synchronisées avec succès !");
    })
    .catch((err) => {
        console.log("Erreur lors de la synchronisation des tables :", err);
    });*/

// Démarrage du serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
