const {ForumCategory} = require('../models');

// Fonction pour lister toutes les catégories de forum
const getAllForumCategories = async (req, res) => {
    try {
        const categories = await ForumCategory.findAll();
        return res.status(200).json(categories);  // Retourne les catégories sous forme de JSON
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des catégories.' });
    }
};

// Fonction pour créer une nouvelle catégorie de forum
const createForumCategory = async (req, res) => {
    const { name } = req.body;

    // Vérifie si le nom de la catégorie est fourni
    if (!name) {
        return res.status(400).json({ message: 'Le nom de la catégorie est requis.' });
    }

    try {
        // Crée une nouvelle catégorie
        const newCategory = await ForumCategory.create({ name });

        return res.status(201).json(newCategory);  // Retourne la catégorie créée
    } catch (error) {
        console.error("Erreur lors de la création de la catégorie:", error);
        return res.status(500).json({ message: 'Une erreur est survenue lors de la création de la catégorie.' });
    }
};

module.exports = {
    getAllForumCategories,
    createForumCategory,
};
