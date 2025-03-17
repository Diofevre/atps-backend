const express = require('express');
const { reactToPost, countPostReactions } = require('../controllers/forumPostReactionControlleur');

const router = express.Router();

// Route pour aimer ou ne pas aimer un post
router.post('/react', reactToPost);
router.get('/count/:post_id', countPostReactions);

module.exports = router;
