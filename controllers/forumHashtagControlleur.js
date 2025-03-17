const { Hashtag, PostHashtag } = require('../models');
const { Sequelize } = require('sequelize');

// Fonction pour créer un hashtag
const createHashtag = async (req, res) => {
  let { name } = req.body;

  // Vérifie si le nom du hashtag commence par "#", sinon on l'ajoute
  if (!name.startsWith("#")) {
    name = `#${name}`;
  }

  try {
    // Vérifie si le hashtag existe déjà
    const existingHashtag = await Hashtag.findOne({
      where: { name },
    });

    if (!existingHashtag) {
      // Crée un nouveau hashtag
      const newHashtag = await Hashtag.create({ name });

      return res.status(201).json(newHashtag); // Retourne le hashtag créé
    }
  } catch (error) {
    console.error("Erreur lors de la création du hashtag:", error);
    return res
      .status(500)
      .json({
        message: "Une erreur est survenue lors de la création du hashtag.",
      });
  }
};

// Fonction pour lister tous les hashtags
const getAllHashtags = async (req, res) => {
  try {
    const hashtags = await Hashtag.findAll();
    return res.status(200).json(hashtags); // Retourne la liste des hashtags
  } catch (error) {
    console.error("Erreur lors de la récupération des hashtags:", error);
    return res
      .status(500)
      .json({
        message:
          "Une erreur est survenue lors de la récupération des hashtags.",
      });
  }
};

const getPopularHashtags = async (req, res) => {
    try {
        const popularHashtags = await Hashtag.findAll({
            attributes: [
                'id', // Sélectionne l'ID du hashtag
                'name', // Sélectionne le nom du hashtag
                [Sequelize.fn('COUNT', Sequelize.col('post_hashtags.hashtag_id')), 'usage_count'] // Compte les occurrences de chaque hashtag
            ],
            include: [
                {
                    model: PostHashtag,
                    as: 'post_hashtags', // Alias de la jointure
                    attributes: [], // Ne pas inclure d'attributs de la table post_hashtags
                }
            ],
            group: ['Hashtag.id'], // Groupe par l'ID du hashtag
            order: [[Sequelize.literal('usage_count'), 'DESC']], // Trie par usage_count en ordre décroissant
            limit: 10, // Limite les résultats aux 10 hashtags les plus populaires
            subQuery: false, // Désactive la sous-requête pour permettre le GROUP BY correct
        });

        res.status(200).json(popularHashtags);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};


module.exports = {
  createHashtag,
  getAllHashtags,
  getPopularHashtags,
};
