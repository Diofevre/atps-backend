const express = require('express');
const { getAllPosts, createPost, updatePost, deletePost, getPostById, getUserPosts } = require('../controllers/forumPostControlleur');
const router = express.Router();

// Route pour récupérer tous les posts
router.get('/', getAllPosts);


// Récupérer un post par son ID
router.get('/id/:post_id', getPostById);

// Récupérer les posts de l'utilisateur authentifié
router.get('/user', getUserPosts);



// Route pour créer un nouveau post
router.post('/', createPost);

// Route pour modifier un post existant
router.put('/:post_id', updatePost);

// Route pour supprimer un post
router.delete('/:post_id', deletePost);

module.exports = router;
