// backend/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const { clerkMiddleware } = require('@clerk/express'); 
const { createCheckoutSession, handleWebhook,  upgradeSubscription, cancelSubscription, resumeSubscription, renewSubscription, getBillingPortal } = require('../controllers/subscriptionController');

// Appliquer clerkMiddleware pour attacher l'objet auth à toutes les requêtes
router.use(clerkMiddleware());

// Route pour upgrader/downgrader un abonnement
router.post("/api/subscription/upgrade", upgradeSubscription);

// Réactiver un abonnement annulé avant expiration
router.post("/api/subscription/resume", resumeSubscription);

// Reprendre un abonnement après expiration
router.post("/api/subscription/renew", renewSubscription);

// Route pour annuler un abonnement
router.post("/api/subscription/cancel", cancelSubscription);

// Route pour les webhooks Stripe (pas d'authentification ici)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Route pour créer une session de paiement
router.post('/api/create-checkout-session', createCheckoutSession);

router.get("/api/subscription/billing-portal", getBillingPortal);


module.exports = router;