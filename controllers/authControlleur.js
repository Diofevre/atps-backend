const stripe = require("../config/stripe");
const { User } = require("../models");
const { clerkClient } = require("@clerk/clerk-sdk-node");

exports.setupUserAfterClerkRegistration = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié avec Clerk
    // req.auth contient les informations de l'utilisateur Clerk
    if (!req.auth || !req.auth.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    }

    const clerkUserId = req.auth.userId;

    // Vérifier si l'utilisateur existe déjà dans la base de données
    let user = await User.findOne({ where: { clerk_id: clerkUserId } });

    // Récupérer les détails de l'utilisateur depuis Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || email;

    // Créer un client Stripe
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        clerk_id: clerkUserId,
      },
    });


    // mettre à jour l'utilisateur dans votre base de données
    user = await User.update(
      { where: { clerk_id: clerkUserId } },
      {
        stripe_customer_id: customer.id,
        trial_start_date: new Date(),
        trial_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
        subscription_status: "trial",
      }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        subscription_status: user.subscription_status,
        trial_end_date: user.trial_end_date,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la configuration de l'utilisateur:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Route à appeler après l'inscription de l'utilisateur avec Clerk
exports.handleClerkWebhook = async (req, res) => {
  const evt = req.body;
  const { type } = evt;
  
  try {
    // Traiter l'événement d'inscription utilisateur
    if (type === "user.created") {
      const { data } = evt;
      const userId = data.id;
      const email = data.email_addresses[0]?.email_address;
      const name =
        `${data.first_name || ""} ${data.last_name || ""}`.trim() || email;

      // Créer un client Stripe
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          clerk_id: userId,
        },
      });
      // Attendre 15 secondes pour que l'utilisateur soit créé dans la base de données
      await new Promise((resolve) => setTimeout(resolve, 15000));
      // Vérifier si l'utilisateur est maintenant dans la base de données
      const user = await User.findOne({ where: { clerkId: userId } });
      if (user) {
        await user.update({
          stripe_customer_id: customer.id,
          trial_start_date: new Date(),
          trial_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
          subscription_status: "trial",
        });
      } else {
        console.warn(
          `Utilisateur avec clerk_id ${userId} non trouvé après attente.`
        );
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook Clerk:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
