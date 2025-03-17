const express = require('express');
const router = express.Router();
const { createHashtag, getAllHashtags, getPopularHashtags } = require('../controllers/forumHashtagControlleur');

// Route pour lister tous les hashtags
router.get('/', getAllHashtags);

// Route pour créer un nouveau hashtag
router.post('/', createHashtag);

router.get("/popular", getPopularHashtags);

module.exports = router;
