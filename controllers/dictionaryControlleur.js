const {Dictionary} = require("../models");
const { Op } = require("sequelize");
const NodeCache = require("node-cache");

/**
 * Liste tous les mots du dictionnaire.
 * @returns {Promise<Array>} - Liste des mots du dictionnaire.
 */
// Cache configuré pour durer 1 heure (3600 secondes)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Vérification toutes les 10 min

const listDictionary = async () => {
  try {
    // Vérifie si les données sont déjà en cache
    const cachedWords = cache.get("dictionaryWords");

    if (cachedWords) {
      console.log("✅ Données récupérées depuis le cache.");
      return cachedWords;
    }

    console.log("📡 Chargement depuis la base de données...");
    const words = await Dictionary.findAll({
      attributes: ["id", "word", "definition", "image_url"],
    });

    // Stocke les résultats en cache pendant 1 heure
    cache.set("dictionaryWords", words);

    return words;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du dictionnaire:", error);
    throw new Error("Impossible de récupérer le dictionnaire.");
  }
};

// Lancer le rafraîchissement toutes les 1 heure
setInterval(listDictionary, 60 * 60 * 1000); // 1 heure = 60 min * 60 sec * 1000 ms

listDictionary();
/**
 * Recherche un mot dans le dictionnaire.
 * @param {string} searchTerm - Le mot à rechercher.
 * @returns {Promise<Object|null>} - Résultat de la recherche ou null si non trouvé.
 */
const searchDictionary = async (searchTerm) => {
    try {
      const words = await Dictionary.findAll({
        where: {
          word: {
            [Op.like]: `%${searchTerm}%`, // Recherche partielle insensible à la casse
          },
        },
      });
      return words;
    } catch (error) {
      console.error("❌ Erreur lors de la recherche du mot:", error);
      throw new Error("Impossible d'effectuer la recherche.");
    }
  };

  const invalidateCache = () => {
    cache.del("dictionaryWords");
    console.log("♻️ Cache du dictionnaire invalidé.");
  };
  
  const addWord = async (word, definition, image_url) => {
    try {
      const newWord = await Dictionary.create({ word, definition, image_url });
      invalidateCache(); // Supprime le cache après ajout
      return newWord;
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du mot:", error);
      throw new Error("Impossible d'ajouter le mot.");
    }
  };
  
  const updateWord = async (id, word, definition, image_url ) => {
    try {
      await Dictionary.update({ word, definition, image_url }, { where: { id } });
      invalidateCache(); // Supprime le cache après mise à jour
      return { message: "Mot mis à jour avec succès." };
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour:", error);
      throw new Error("Impossible de mettre à jour le mot.");
    }
  };
  
  const deleteWord = async (id) => {
    try {
      await Dictionary.destroy({ where: { id } });
      invalidateCache(); // Supprime le cache après suppression
      return { message: "Mot supprimé avec succès." };
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      throw new Error("Impossible de supprimer le mot.");
    }
  };
  
  

module.exports = { listDictionary, searchDictionary, addWord, updateWord, deleteWord };
