const express = require('express');
const { createComment, listComments, updateComment, deleteComment } = require('../controllers/commentControlleur');
const router = express.Router();

router.post('/create', createComment);
router.get('/list/:questionId', listComments);
// Route pour supprimer un commentaire
router.delete('/:commentId', deleteComment);

// Route pour modifier un commentaire
router.put('/update/:commentId', updateComment);

module.exports = router;
