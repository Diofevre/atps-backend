// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { handleClerkWebhook, setupUserAfterClerkRegistration } = require('../controllers/authControlleur');
const { requireAuth } = require('@clerk/clerk-sdk-node');

// Route pour le webhook Clerk
router.post('/clerk-webhook', express.json({ 
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
    console.log("Webhook reçu:", req.body);
  }

}), handleClerkWebhook);

// Route pour configurer l'utilisateur après l'inscription Clerk
router.post('/setup-after-registration', requireAuth(), setupUserAfterClerkRegistration);

module.exports = router;