const {Report} = require('../models');

// Créer un nouveau rapport
const createReport = async (req, res) => {
    const user_id = req.auth.userId;
      if (!user_id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
  try {
    const { categorie, contenu } = req.body;
    
    if (!categorie || !contenu) {
      return res.status(400).json({ message: "Categorie et contenu sont obligatoires." });
    }

    const newReport = await Report.create({
      user_id,
      categorie,
      contenu
    });

    res.status(201).json({ message: "Rapport créé avec succès", report: newReport });
  } catch (error) {
    console.error("Erreur lors de la création du rapport :", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll();
    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
  }
};


const updateReportSeen = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Vérifier si le rapport existe
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: "Rapport non trouvé." });
    }

    // Mettre à jour le champ "seen"
    await report.update({ seen: true });

    return res.status(200).json({ message: "Le rapport a été marqué comme vu." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rapport :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


module.exports = {
  createReport,
  getAllReports,
  updateReportSeen,
};
