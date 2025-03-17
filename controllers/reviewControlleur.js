const {Review} = require('../models');

const createReview = async (req, res) => {
    try {
      const { question_id, country_seen, information, info_accuracy } = req.body;
      const user_id = req.auth.userId;
      if (!user_id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      if (!user_id || !question_id) {
        return res.status(400).json({ message: "user_id and country_seen are required." });
      }
  
      const newReview = await Review.create({
        user_id,
        question_id,
        country_seen,
        information,
        info_accuracy
      });
  
      res.status(201).json({
        message: "Review created successfully",
        review: newReview
      });
      
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  };

  const getAllReviews = async (req, res) => {
    try {
      const reviews = await Review.findAll();
      return res.status(200).json(reviews);
    } catch (error) {
      return res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    }
  };
  

// Fonction pour marquer une revue comme vue
const markReviewAsSeen = async (req, res) => {
  const { reviewId } = req.params;

  try {
    // Rechercher la revue par son ID
    const review = await Review.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      // Si la revue n'est pas trouvée, renvoyer une erreur 404
      return res.status(404).json({
        message: "Revue non trouvée.",
      });
    }

    // Mettre à jour le champ 'seen' à true
    review.seen = true;
    await review.save();

    // Répondre avec un message de succès
    return res.status(200).json({
      message: "La revue a été marquée comme vue.",
    });
  } catch (error) {
    // Gérer les erreurs potentielles
    return res.status(500).json({
      message: "Erreur interne du serveur",
    });
  }
};


  module.exports = {
    createReview,
    getAllReviews,
    markReviewAsSeen,
  };
  