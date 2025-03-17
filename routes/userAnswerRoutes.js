const express = require('express');
const router = express.Router();
const userAnswerController = require('../controllers/userAnswerController');  

// Route pour récupérer les réponses par statut (correctes ou incorrectes)
router.get('/answers/status', userAnswerController.getAnswersByStatus);

module.exports = router;
