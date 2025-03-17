const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteOwnAccount,
  suspendUser,
} = require('../controllers/userController');


// Route pour récupérer tous les utilisateurs
router.get('/', getAllUsers);

// Route pour récupérer les informations de l'utilisateur connecté
router.get('/me', getUserById);

router.post("/suspend", suspendUser);

// Route pour mettre à jour les informations de l'utilisateur connecté
router.put('/me', updateUser);

// Route pour supprimer le compte de l'utilisateur connecté
router.delete('/me', deleteOwnAccount);


module.exports = router;
