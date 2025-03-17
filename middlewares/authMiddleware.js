const { requireAuth } = require('@clerk/express');
const {User} = require('../models');

exports.checkSubscription = [
  requireAuth(),
  async (req, res, next) => {
    try {
      // Récupérer l'utilisateur depuis votre base de données
      const user = await User.findOne({ where: { clerkId: req.auth.userId } });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        });
      }
      
      // Vérifier si l'utilisateur est en période d'essai
      if (user.subscription_status === 'trial') {
        const now = new Date();
        if (now > user.trial_end_date) {
          // Mettre à jour le statut si la période d'essai est terminée
          await User.update(
            { subscription_status: 'expired' },
            { where: { id: user.id } }
          );
          return res.status(403).json({ 
            success: false, 
            message: 'Votre période d\'essai est terminée. Veuillez vous abonner pour continuer.' 
          });
        }
      } 
      // Vérifier si l'abonnement est expiré
      else if (user.subscription_status === 'expired') {
        return res.status(403).json({ 
          success: false, 
          message: 'Votre abonnement a expiré. Veuillez vous abonner pour continuer.' 
        });
      }
      else if (user.suspended) {
        return res.status(403).json({ message: "Your account is suspended" });
      }
      
      // Stocker l'utilisateur et le type d'abonnement pour un accès facile
      req.user = user;
      req.subscriptionType = user.subscription_status;
      next();
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
];

// Middleware pour les fonctionnalités premium uniquement
exports.premiumOnly = (req, res, next) => {
  if (req.subscriptionType !== 'premium') {
    return res.status(403).json({ 
      success: false, 
      message: 'Cette fonctionnalité nécessite un abonnement Premium.' 
    });
  }
  next();
};


exports.isAdmin = async (req, res, next) => {
  try {
    const userId = req.auth.userId; // Récupérer l'ID de l'utilisateur depuis l'auth
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findOne({ where: { clerkId: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Vérifier si l'utilisateur est admin
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
    }

    // Passer à l'étape suivante si c'est un admin
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
