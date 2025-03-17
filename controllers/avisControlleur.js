const { Op } = require("sequelize");
const {Avis} = require("../models");

/**
 * 🔹 Récupérer tous les avis avec option de recherche.
 * @param {Object} req - Requête HTTP (query: search)
 * @param {Object} res - Réponse HTTP
 */
const getAllAvis = async (req, res) => {
  try {
    const { search } = req.query;

    const whereCondition = search
      ? {
          [Op.or]: [
            { nom: { [Op.like]: `%${search}%` } },
            { prenom: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { subject: { [Op.like]: `%${search}%` } },
            { message: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const avis = await Avis.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]], // Trie par date de création, les plus récents d'abord
    });

    res.status(200).json(avis);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des avis:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

/**
 * 🔹 Récupérer un avis par ID.
 * @param {Object} req - Requête HTTP (params: id)
 * @param {Object} res - Réponse HTTP
 */
const getAvisById = async (req, res) => {
  try {
    const { id } = req.params;
    const avis = await Avis.findByPk(id);

    if (!avis) {
      return res.status(404).json({ message: "Avis non trouvé." });
    }

    res.status(200).json(avis);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'avis:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

/**
 * 🔹 Ajouter un nouvel avis.
 * @param {Object} req - Requête HTTP (body: nom, prenom, email, phone, subject, message)
 * @param {Object} res - Réponse HTTP
 */
const createAvis = async (req, res) => {
  try {
    const { nom, prenom, email, phone, subject, message } = req.body;

    if (!nom || !prenom || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const newAvis = await Avis.create({ nom, prenom, email, phone, subject, message });

    res.status(201).json(newAvis);
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de l'avis:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

/**
 * 🔹 Mettre à jour un avis.
 * @param {Object} req - Requête HTTP (params: id, body: données mises à jour)
 * @param {Object} res - Réponse HTTP
 */
const updateAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, phone, subject, message } = req.body;

    const avis = await Avis.findByPk(id);
    if (!avis) {
      return res.status(404).json({ message: "Avis non trouvé." });
    }

    await avis.update({ nom, prenom, email, phone, subject, message });

    res.status(200).json({ message: "Avis mis à jour avec succès." });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de l'avis:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

/**
 * 🔹 Supprimer un avis.
 * @param {Object} req - Requête HTTP (params: id)
 * @param {Object} res - Réponse HTTP
 */
const deleteAvis = async (req, res) => {
  try {
    const { id } = req.params;
    const avis = await Avis.findByPk(id);

    if (!avis) {
      return res.status(404).json({ message: "Avis non trouvé." });
    }

    await avis.destroy();

    res.status(200).json({ message: "Avis supprimé avec succès." });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'avis:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

module.exports = {
  getAllAvis,
  getAvisById,
  createAvis,
  updateAvis,
  deleteAvis,
};
