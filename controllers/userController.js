const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {User} = require('../models'); 
const stripe = require("../config/stripe"); 
const {envoyerEmail} = require("../services/emailService");


// Fonction pour récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    // Récupérer tous les utilisateurs
    const users = await User.findAll();

    // Envoyer la réponse
    return res.status(200).json({
       users,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);

    // Gérer l'erreur
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des utilisateurs',
      error: error.message,
    });
  }
};

// Fonction pour récupérer les informations d'un utilisateur spécifique
const getUserById = async (req, res) => {
  try {
    const id = req.auth.userId;
    if(!id) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    // Récupérer l'utilisateur par son ID
    const user = await User.findOne({where: {clerkId: id}});

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la récupération de l'utilisateur.",
      error: error.message,
    });
  }
};

// Fonction pour modifier les informations d'un utilisateur
const updateUser = async (req, res) => {
  try {
    const id = req.auth.userId;
    if (!id) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }
    const { name, username, email, picture, language, country } = req.body;

    // Récupérer l'utilisateur par son ID
    const user = await User.findOne({where: {clerkId: id}});

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    // Mettre à jour les informations de l'utilisateur
    await user.update({
      name: name || user.name,
      username: username || user.username,
      email: email || user.email,
      picture: picture || user.picture,
      language: language || user.language,
      country: country || user.country,
    });

    return res.status(200).json({
      message: "Les informations de l'utilisateur ont été mises à jour avec succès.",
      user,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
      error: error.message,
    });
  }
};

// Fonction pour qu'un utilisateur supprime son propre compte
const deleteOwnAccount = async (req, res) => {
  try {
    // L'ID de l'utilisateur est supposé être extrait depuis l'authentification (par exemple, middleware)
    const userId = req.auth.userId; 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Récupérer l'utilisateur par son ID
    const user = await User.findOne({where: {clerkId: userId}});

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    // Supprimer l'utilisateur
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "Votre compte a été supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte utilisateur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de votre compte.",
      error: error.message,
    });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { userId, action } = req.body; // action = "suspend" ou "unsuspend"

    const user = await User.findOne({ where: { clerkId: userId } });
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "suspend") {
      if (user.subscription_id) {
        await stripe.subscriptions.update(user.subscription_id, {
          pause_collection: { behavior: "keep_as_draft" },
        });
      }

      await user.update({ suspended: true });

      // 🔴 Envoyer un e-mail de suspension
      await envoyerEmail(
        user.email,
        "Account Suspended - ATPS",
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: red;">Your Account Has Been Suspended</h2>
            <p>Hello ${user.username},</p>
            <p>We regret to inform you that your account has been suspended. During this period, you will not be able to access the application.</p>
            <p>If you believe this is a mistake or have any concerns, please contact our support team.</p>
            <p>Thank you for your understanding.</p>
            <p><strong>The ATPS Team</strong></p>
          </div>
        `
      );

      return res.json({ message: "User suspended and subscription paused" });
    }

    if (action === "unsuspend") {
      if (user.subscription_id) {
        await stripe.subscriptions.update(user.subscription_id, {
          pause_collection: "",
        });
      }

      await user.update({ suspended: false });

      // 🟢 Envoyer un e-mail de réactivation
      await envoyerEmail(
        user.email,
        "Account Reactivated - ATPS",
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: green;">Your Account Has Been Reactivated</h2>
            <p>Hello ${user.username},</p>
            <p>Good news! Your account has been successfully reactivated. You can now access all the features of our application.</p>
            <p>If you experience any issues, please reach out to our support team.</p>
            <p>Welcome back!</p>
            <p><strong>The ATPS Team</strong></p>
          </div>
        `
      );

      return res.json({ message: "User unsuspended and subscription resumed" });
    }

    res.status(400).json({ message: "Invalid action" });

  } catch (error) {
    console.error("Error updating suspension:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Inscription 
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (user)
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Connexion
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    console.log("Password entered:", password);
    console.log("Hashed password in DB:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteOwnAccount,
  suspendUser,  
  register,
  login,
};
