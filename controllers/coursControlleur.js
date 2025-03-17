const Cours = require("../models/Cours");

// 📌 Créer un nouveau cours
exports.createCours = async (req, res) => {
  try {
    const { topic_id, title, nom_dossier_s3 } = req.body;

    const cours = await Cours.create({ topic_id, title, nom_dossier_s3 });

    return res.status(201).json({ message: "Cours créé avec succès", cours });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Récupérer tous les cours
exports.getAllCours = async (req, res) => {
  try {
    const cours = await Cours.findAll();
    return res.status(200).json(cours);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Récupérer un seul cours par ID
exports.getCoursById = async (req, res) => {
  try {
    const { id } = req.params;
    const cours = await Cours.findByPk(id);

    if (!cours) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    return res.status(200).json(cours);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Mettre à jour un cours
exports.updateCours = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic_id, title, nom_dossier_s3 } = req.body;

    const cours = await Cours.findByPk(id);
    if (!cours) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    await cours.update({ topic_id, title, nom_dossier_s3 });

    return res.status(200).json({ message: "Cours mis à jour avec succès", cours });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Supprimer un cours
exports.deleteCours = async (req, res) => {
  try {
    const { id } = req.params;

    const cours = await Cours.findByPk(id);
    if (!cours) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    await cours.destroy();
    return res.status(200).json({ message: "Cours supprimé avec succès" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
