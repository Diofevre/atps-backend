const express = require('express');
const router = express.Router();
const { getAllForumCategories, createForumCategory } = require('../controllers/forumCategoryControlleur');

// Route pour lister toutes les catégories
router.get('/', getAllForumCategories);

// Route pour créer une nouvelle catégorie
router.post('/', createForumCategory);

module.exports = router;
