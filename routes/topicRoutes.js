const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

// Route pour récupérer tous les topics
router.get('/', topicController.getAllTopics);

router.get('/:topicId/chapters', topicController.getChaptersAndSubChapters);


// Route pour créer un nouveau sujet
router.post('/', topicController.createTopic);

// Route pour mettre à jour un sujet
router.put('/:id', topicController.updateTopic);

// Route pour obtenir un sujet par son ID
router.get('/:id', topicController.getTopicById);

// Route pour supprimer un sujet
router.delete('/:id', topicController.deleteTopic);

module.exports = router;
