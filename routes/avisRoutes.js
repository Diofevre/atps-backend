const express = require("express");
const avisController = require("../controllers/avisControlleur");

const router = express.Router();

/**
 * Route pour récupérer tous les avis (avec recherche)
 */
router.get("/", avisController.getAllAvis);

/**
 * Route pour récupérer un avis par ID
 */
router.get("/:id", avisController.getAvisById);

/**
 * Route pour créer un nouvel avis
 */
router.post("/", avisController.createAvis);

/**
 * Route pour mettre à jour un avis
 */
router.put("/:id", avisController.updateAvis);

/**
 * Route pour supprimer un avis
 */
router.delete("/:id", avisController.deleteAvis);

module.exports = router;
