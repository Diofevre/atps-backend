const express = require('express');
const { reactToComment, countCommentReactions } = require('../controllers/forumCommentReactionControlleur');

const router = express.Router();

// Route pour réagir à un commentaire (like/dislike)
router.post('/react', reactToComment);

// Route pour obtenir le nombre de likes/dislikes d'un commentaire
router.get('/count/:comment_id', countCommentReactions);

module.exports = router;
