const express = require("express");
const {
  listDictionary,
  searchDictionary,
  addWord,
  updateWord,
  deleteWord,
} = require("../controllers/dictionaryControlleur");

const router = express.Router();

/**
 * Route pour récupérer la liste du dictionnaire.
 */
router.get("/", async (req, res) => {
  try {
    const words = await listDictionary();
    res.json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Route pour rechercher un mot dans le dictionnaire.
 */
router.get("/search", async (req, res) => {
  const { word } = req.query;

  if (!word) {
    return res.status(400).json({ message: "Le paramètre 'word' est requis." });
  }

  try {
    const result = await searchDictionary(word);
    if (result.length > 0) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Mot non trouvé." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Route pour ajouter un nouveau mot dans le dictionnaire.
 */
router.post("/", async (req, res) => {
  const { word, definition, image_url } = req.body;

  if (!word || !definition) {
    return res.status(400).json({ message: "Les champs 'word' et 'definition' sont requis." });
  }

  try {
    const newWord = await addWord(word, definition, image_url);
    res.status(201).json(newWord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Route pour mettre à jour la définition d'un mot existant.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { word, definition, image_url } = req.body;

  if (!definition) {
    return res.status(400).json({ message: "Le champ 'definition' est requis." });
  }

  try {
    const result = await updateWord(id, word, definition, image_url );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Route pour supprimer un mot du dictionnaire.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteWord(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
