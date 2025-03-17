const express = require('express');
const { createComment, getAllCommentsForPost, getCommentWithReplies, updateComment, deleteComment} = require('../controllers/forumCommentControlleur')
const router = express.Router();

router.post('/', createComment); // Créer un commentaire
router.get('/posts/:post_id', getAllCommentsForPost); // Récupérer tous les commentaires d'un post
router.get('/:comment_id', getCommentWithReplies); // Récupérer un commentaire spécifique et ses réponses
router.put('/:comment_id', updateComment); // Mettre à jour un commentaire
router.delete('/:comment_id', deleteComment); // Supprimer un commentaire

module.exports = router;
