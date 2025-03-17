const express = require('express');
const router = express.Router();
const subChapterController = require('../controllers/subChapterControlleur');

// Create a new subchapter
router.post('/', subChapterController.createSubChapter);

// Get all subchapters
router.get('/', subChapterController.getAllSubChapters);

// Get a specific subchapter by ID
router.get('/:id', subChapterController.getSubChapterById);

router.get("/chapters/:chapter_id", subChapterController.getSubChaptersByChapter);

// Update a subchapter by ID
router.put('/:id', subChapterController.updateSubChapter);

// Delete a subchapter by ID
router.delete('/:id', subChapterController.deleteSubChapter);



module.exports = router;
