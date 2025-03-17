const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterControlleur');  

// Route pour créer un chapitre
router.post('/', chapterController.createChapter);

// Route pour obtenir tous les chapitres
router.get('/', chapterController.getAllChapters);

// Route pour obtenir un chapitre spécifique par son ID
router.get('/:id', chapterController.getChapterById);

router.get("/topics/:topic_id", chapterController.getChaptersByTopic);

// Route pour mettre à jour un chapitre par son ID
router.put('/:id', chapterController.updateChapter);

// Route pour supprimer un chapitre par son ID (soft delete)
router.delete('/:id', chapterController.deleteChapter);

module.exports = router;
