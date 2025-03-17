const stripe = require("../config/stripe");
const { User } = require("../models");
const { envoyerEmail } = require("../services/emailService");
const { Op } = require("sequelize");

exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await User.findOne({ where: { clerkId: userId } });

    let { plan, billingCycle } = req.body; // "standard" ou "premium" + durée (1, 3, 6, 12)
    
    if (!["standard", "premium"].includes(plan) || ![1, 3, 6, 12].includes(billingCycle)) {
      return res.status(400).json({ error: "Invalid subscription plan or duration" });
    }

    // Sélectionner l'ID Stripe correspondant au plan et à la durée
    const priceKey = `STRIPE_${plan.toUpperCase()}_${billingCycle}M_PRICE_ID`;
    const priceId = process.env[priceKey];

    if (!priceId) {
      return res.status(500).json({ error: "Invalid Stripe price ID" });
    }

    const session = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.FRONT_URL}/success`,
      cancel_url: `${process.env.FRONT_URL}/cancelled`,
    });

    // Mettre à jour l'utilisateur avec le choix d'abonnement
    const pricePerMonth = plan === "standard"
      ? { 1: 25, 3: 20, 6: 15, 12: 10 }[billingCycle]
      : { 1: 35, 3: 30, 6: 25, 12: 20 }[billingCycle];

      // Calculer les nouvelles dates
    const startDate = new Date(); // Date actuelle
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + billingCycle); // Ajoute la durée choisie

    await user.update({
      subscription_plan: plan,
      billing_cycle: billingCycle,
      price_per_month: pricePerMonth,
      trial_start_date: startDate,
      trial_end_date: endDate,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Error de webhook: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Gérer les événements Stripe
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // Mettre à jour l'abonnement de l'utilisateur
      await handleSuccessfulSubscription(session);
      break;
    case "customer.updated":
      const updatedCustomer = event.data.object;
      await handlePaymentMethodUpdate(updatedCustomer);
      break;
    case "customer.subscription.updated":
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;
    case "customer.subscription.deleted":
      const cancelledSubscription = event.data.object;
      await handleSubscriptionCancellation(cancelledSubscription);
      break;
    case "invoice.payment_failed":
      const failedInvoice = event.data.object;
      await handleFailedPayment(failedInvoice);
      break;
  }

  res.status(200).json({ received: true });
};

async function handleSuccessfulSubscription(session) {
  // Récupérer l'abonnement pour déterminer le niveau et la durée
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const priceId = subscription.items.data[0].price.id;

  // Trouver l'utilisateur correspondant
  const user = await User.findOne({
    where: { stripe_customer_id: session.customer },
  });

  if (!user) {
    console.error("User not found for customer ID:", session.customer);
    return;
  }

  // Déterminer le type d'abonnement et la durée
  let subscriptionPlan, billingCycle, pricePerMonth;

  const priceMapping = {
    [process.env.STRIPE_STANDARD_1M_PRICE_ID]: { plan: "standard", cycle: 1, price: 25 },
    [process.env.STRIPE_STANDARD_3M_PRICE_ID]: { plan: "standard", cycle: 3, price: 20 },
    [process.env.STRIPE_STANDARD_6M_PRICE_ID]: { plan: "standard", cycle: 6, price: 15 },
    [process.env.STRIPE_STANDARD_12M_PRICE_ID]: { plan: "standard", cycle: 12, price: 10 },

    [process.env.STRIPE_PREMIUM_1M_PRICE_ID]: { plan: "premium", cycle: 1, price: 35 },
    [process.env.STRIPE_PREMIUM_3M_PRICE_ID]: { plan: "premium", cycle: 3, price: 30 },
    [process.env.STRIPE_PREMIUM_6M_PRICE_ID]: { plan: "premium", cycle: 6, price: 25 },
    [process.env.STRIPE_PREMIUM_12M_PRICE_ID]: { plan: "premium", cycle: 12, price: 20 },
  };

  if (priceMapping[priceId]) {
    subscriptionPlan = priceMapping[priceId].plan;
    billingCycle = priceMapping[priceId].cycle;
    pricePerMonth = priceMapping[priceId].price;
  } else {
    console.error("Unknown price ID:", priceId);
    return;
  }

  // Convertir les timestamps Stripe en dates JavaScript
  const startDate = new Date(subscription.start_date * 1000);
  const endDate = new Date(subscription.current_period_end * 1000);

  // Mettre à jour l'utilisateur dans la base de données
  await user.update({
    subscription_status: subscriptionPlan,
    subscription_id: session.subscription,
    subscription_plan: subscriptionPlan,
    billing_cycle: billingCycle,
    price_per_month: pricePerMonth,
    trial_start_date: startDate, // Nouvelle date de début d'abonnement
    trial_end_date: endDate, // Nouvelle date de fin d'abonnement
  });

  // Envoyer un email de confirmation
  await envoyerEmail(
    user.email,
    "Subscription Confirmation - ATPS",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #EECE84;">Subscription Confirmation</h2>
        <p>Hello ${user.username},</p>
        <p>We are pleased to inform you that your subscription has been successfully activated!</p>
        <ul>
          <li><strong>Subscription Plan:</strong> ${subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)}</li>
          <li><strong>Duration:</strong> ${billingCycle} month(s)</li>
          <li><strong>Price per month:</strong> $${pricePerMonth}</li>
          <li><strong>Start Date:</strong> ${new Date(subscription.start_date * 1000).toLocaleDateString()}</li>
          <li><strong>Next Billing Date:</strong> ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}</li>
        </ul>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p style="margin-top: 20px;">Thank you for choosing ATPS!</p>
        <p><strong>The ATPS Team</strong></p>
      </div>
    `
  );
}


/**
 * Gère la mise à jour d'un abonnement Stripe
 * @param {Object} subscription - L'objet subscription de Stripe
 */
async function handleSubscriptionUpdate(subscription) {
  try {
    console.log("Traitement de la mise à jour d'abonnement:", subscription.id);

    // Récupérer le customer_id pour identifier l'utilisateur
    const stripeCustomerId = subscription.customer;

    // Déterminer le statut de l'abonnement
    let subscriptionStatus;

    // Vérifier le statut de l'abonnement et sa période d'essai
    if (subscription.status === "active") {
      // Récupérer l'ID du prix pour déterminer le niveau d'abonnement
      const priceId = subscription.items.data[0].price.id;

      if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) {
        subscriptionStatus = "standard";
      } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
        subscriptionStatus = "premium";
      }
    } else if (
      subscription.status === "past_due" ||
      subscription.status === "unpaid"
    ) {
      // L'abonnement a des problèmes de paiement mais est toujours actif
      // Vous pouvez choisir de le maintenir actif ou de le marquer comme un statut spécial
      subscriptionStatus = "payment_issue";
    } else if (subscription.status === "trialing") {
      // Si l'abonnement est en période d'essai gérée par Stripe (différent de votre période d'essai initiale)
      subscriptionStatus = "trial";
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "incomplete_expired"
    ) {
      // L'abonnement a été annulé ou n'a pas pu être activé
      subscriptionStatus = "expired";
    }

    // Si nous avons un statut à mettre à jour
    if (subscriptionStatus) {
      // Mettre à jour l'utilisateur dans la base de données
      await User.update(
        { subscription_status: subscriptionStatus },
        { where: { stripe_customer_id: stripeCustomerId } }
      );

      console.log(
        `Statut d'abonnement mis à jour pour ${stripeCustomerId}: ${subscriptionStatus}`
      );
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'abonnement:", error);
  }
}

/**
 * Gère l'annulation d'un abonnement Stripe
 * @param {Object} subscription - L'objet subscription de Stripe
 */
async function handleSubscriptionCancellation(subscription) {
  try {
    console.log("Traitement de l'annulation d'abonnement:", subscription.id);

    // Récupérer le customer_id pour identifier l'utilisateur
    const stripeCustomerId = subscription.customer;

    // Mettre à jour le statut de l'utilisateur dans la base de données
    await User.update(
      {
        subscription_status: "expired",
        subscription_id: null, // Effacer l'ID d'abonnement puisqu'il n'est plus actif
        trial_start_date: null,
        trial_end_date: null,
      },
      { where: { stripe_customer_id: stripeCustomerId } }
    );

    console.log(`Abonnement annulé pour ${stripeCustomerId}`);

    // Optionnel: Envoyer un email à l'utilisateur pour l'informer de l'annulation
    const user = await User.findOne({
      where: { stripe_customer_id: stripeCustomerId },
    });
    if (user) {
      await envoyerEmail(
        user.email,
        "Subscription Canceled - ATPS",
        `<div>
              <h2>Subscription Canceled</h2>
              <p>Hello ${user.username},</p>
              <p>Your subscription has been canceled. If this was a mistake, you can resubscribe anytime.</p>
              <p>Thank you for using ATPS.</p>
            </div>`
      );

      console.log(`Email de notification d'annulation envoyé à ${user.email}`);
    }

    // Optionnel: Vérifier si l'abonnement a une fin de période de facturation future
    if (subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end * 1000); // Convertir timestamp Unix en Date
      const now = new Date();

      // Si la période actuelle n'est pas encore terminée, programmer une tâche pour supprimer l'accès à cette date
      if (endDate > now) {
        console.log(`L'accès restera actif jusqu'au ${endDate.toISOString()}`);
        // Ici, vous pourriez ajouter une entrée à une table de tâches planifiées
        // ou utiliser un service comme Bull Queue pour planifier la révocation d'accès
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'abonnement:", error);
  }
}

const handlePaymentMethodUpdate = async (customer) => {
  try {
    // Trouver l'utilisateur dans la base de données avec son Stripe Customer ID
    const user = await User.findOne({
      where: { stripe_customer_id: customer.id },
    });

    if (!user) {
      console.error(`Utilisateur non trouvé pour le Stripe ID: ${customer.id}`);
      return;
    }

    // Envoyer un email de confirmation
    await envoyerEmail(
      user.email,
      "Payment Method Updated - ATPS",
      `<div>
            <h2>Payment Method Updated</h2>
            <p>Hello ${user.name},</p>
            <p>Your payment method has been successfully updated.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>Thank you for using ATPS.</p>
          </div>`
    );

  
  } catch (error) {
    console.error(
      "Erreur lors de la gestion de la mise à jour du moyen de paiement:",
      error
    );
  }
};

/**
 * Fonction pour upgrader/downgrader un abonnement
 */
exports.upgradeSubscription = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { clerkId: userId } });

    if (!user || !user.subscription_id) {
      return res
        .status(400)
        .json({ success: false, message: "User or subscription not found" });
    }

    let { newPlan, billingCycle } = req.body; // 'standard' ou 'premium' + durée (1, 3, 6, 12)
    
    if (!["standard", "premium"].includes(newPlan) || ![1, 3, 6, 12].includes(billingCycle)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan type or duration" });
    }

    // Sélectionner le bon ID de prix Stripe
    const priceKey = `STRIPE_${newPlan.toUpperCase()}_${billingCycle}M_PRICE_ID`;
    const newPriceId = process.env[priceKey];

    if (!newPriceId) {
      return res.status(500).json({ success: false, message: "Invalid Stripe price ID" });
    }

    // Récupérer l'abonnement actuel
    const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
     // Calculer les nouvelles dates d'essai
     const startDate = new Date(); // Date actuelle
     const endDate = new Date();
     endDate.setMonth(endDate.getMonth() + billingCycle); // Ajout de la durée

    if (newPlan === "premium") {
      // 🔼 UPGRADE → Facturation immédiate
      await stripe.subscriptions.update(user.subscription_id, {
        items: [{ id: subscription.items.data[0].id, price: newPriceId }],
        proration_behavior: "always_invoice",
      });

      // Générer et prélever immédiatement la facture
      const invoice = await stripe.invoices.create({
        customer: user.stripe_customer_id,
        auto_advance: true, // Tenter automatiquement le paiement
      });

      await stripe.invoices.finalizeInvoice(invoice.id);

      // Mettre à jour la base de données
      const pricePerMonth = newPlan === "standard"
        ? { 1: 25, 3: 20, 6: 15, 12: 10 }[billingCycle]
        : { 1: 35, 3: 30, 6: 25, 12: 20 }[billingCycle];

      await user.update({
        subscription_status: newPlan,
        subscription_plan: newPlan,
        billing_cycle: billingCycle,
        price_per_month: pricePerMonth,
        subscription_status: newPlan,
        trial_start_date: startDate,
        trial_end_date: endDate,
      });

      await envoyerEmail(
        user.email,
        "Subscription Upgrade Confirmation - ATPS",
        `<div>
            <h2>Subscription Upgrade</h2>
            <p>Hello ${user.username},</p>
            <p>Your subscription has been successfully upgraded to <strong>${newPlan} (${billingCycle} months)</strong>.</p>
            <p>Thank you for choosing ATPS.</p>
          </div>`
      );
    } else if (newPlan === "standard") {
      // 🔽 DOWNGRADE → Changement à la fin du cycle
      await stripe.subscriptions.update(user.subscription_id, {
        items: [{ id: subscription.items.data[0].id, price: newPriceId }],
        proration_behavior: "none", // Pas de facturation immédiate
        cancel_at_period_end: true, // Changement à la fin du cycle
      });

      await envoyerEmail(
        user.email,
        "Subscription Downgrade Scheduled - ATPS",
        `<div>
            <h2>Subscription Downgrade Scheduled</h2>
            <p>Hello ${user.username},</p>
            <p>Your subscription downgrade to <strong>${newPlan} (${billingCycle} months)</strong> will take effect at the end of your current billing cycle.</p>
            <p>Thank you for choosing ATPS.</p>
          </div>`
      );
    }

    res.json({
      success: true,
      message: `Subscription update scheduled for ${newPlan} (${billingCycle} months)`,
    });
  } catch (error) {
    console.error("Error upgrading/downgrading subscription:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Fonction pour annuler un abonnement Stripe
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const user = await User.findOne({ where: { clerkId: userId } });

    if (!user || !user.subscription_id) {
      return res
        .status(400)
        .json({ success: false, message: "User or subscription not found" });
    }

    // Récupérer l'abonnement Stripe actuel
    const subscription = await stripe.subscriptions.retrieve(user.subscription_id);

    // Vérifier si l'abonnement est déjà annulé
    if (subscription.cancel_at_period_end) {
      return res.json({
        success: true,
        message: "Subscription is already set to cancel at the end of the billing period.",
      });
    }

    // Annuler l'abonnement (il restera actif jusqu'à la fin du cycle de facturation)
    await stripe.subscriptions.update(user.subscription_id, {
      cancel_at_period_end: true,
    });

    // Mettre à jour la base de données
    await user.update({
      subscription_status: "canceling",
      billing_cycle: 0, // Réinitialiser la durée d'abonnement
      price_per_month: 0, // Réinitialiser le prix mensuel
    });

    await envoyerEmail(
      user.email,
      "Subscription Cancellation Request - ATPS",
      `<div>
          <h2>Subscription Cancellation</h2>
          <p>Hello ${user.username},</p>
          <p>Your subscription will remain active until the end of your billing period.</p>
          <p>If you change your mind, you can resubscribe before the end date.</p>
          <p>Thank you for using ATPS.</p>
        </div>`
    );

    res.json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


async function handleFailedPayment(invoice) {
  try {
    const stripeCustomerId = invoice.customer;
    const user = await User.findOne({
      where: { stripe_customer_id: stripeCustomerId },
    });

    if (!user) return console.error("User not found for failed payment");

    // Mettre à jour le statut de l'abonnement
    await User.update(
      { subscription_status: "past_due" },
      { where: { stripe_customer_id: stripeCustomerId } }
    );

    // Envoyer un email pour alerter l'utilisateur
    await envoyerEmail(
      user.email,
      "Payment Failed - Action Required",
      `
            <p>Hello ${user.username},</p>
            <p>We tried to charge your card, but the payment failed. Please update your payment method to continue using our service.</p>
            <p><a href="${process.env.FRONT_URL}/update-payment">Update Payment Method</a></p>
            <p>Thank you,</p>
            <p><strong>The ATPS Team</strong></p>
            `
    );

    console.log(`Payment failed email sent to ${user.email}`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

exports.resumeSubscription = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { clerkId: userId } });

    if (!user || !user.subscription_id) {
      return res
        .status(400)
        .json({ success: false, message: "User or subscription not found" });
    }

    const subscription = await stripe.subscriptions.retrieve(user.subscription_id);

    if (!subscription.cancel_at_period_end) {
      return res.json({
        success: false,
        message: "Subscription is already active",
      });
    }

    // Réactiver l'abonnement
    await stripe.subscriptions.update(user.subscription_id, {
      cancel_at_period_end: false, // Annule l'annulation
    });

    // Vérifier le dernier plan de l'utilisateur
    const lastPlan = ["standard", "premium"].includes(user.subscription_status)
      ? user.subscription_status
      : "standard"; // Valeur par défaut

    // Déterminer la durée et le prix de l'abonnement
    const billingCycle = lastPlan === "premium" ? 12 : 1; // Premium → 12 mois, Standard → 1 mois
    const pricePerMonth = lastPlan === "premium" ? 20.0 : 10.0; // Exemple de prix

     // Calcul des dates d'essai
     const trialStart = new Date();
     const trialEnd = new Date();
     trialEnd.setMonth(trialEnd.getMonth() + billingCycle);

    // Mettre à jour la base de données avec le dernier plan
    await user.update({
      subscription_status: lastPlan,
      billing_cycle: billingCycle,
      price_per_month: pricePerMonth,
      trial_start_date: trialStart,
      trial_end_date: trialEnd,
    });

    await envoyerEmail(
      user.email,
      "Subscription Reactivation - ATPS",
      `<div>
          <h2>Subscription Reactivated</h2>
          <p>Hello ${user.username},</p>
          <p>Your subscription cancellation has been reversed. You will continue to have access without interruption.</p>
          <p>Thank you for staying with ATPS.</p>
      </div>`
    );

    res.json({
      success: true,
      message: `Subscription reactivated successfully with plan ${lastPlan}`,
    });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.renewSubscription = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { clerkId: userId } });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    let { plan, billingCycle } = req.body; // 'standard' ou 'premium' + durée (1, 3, 6, 12)
    let priceId, pricePerMonth;

    if (plan === "standard") {
      priceId = process.env.STRIPE_STANDARD_PRICE_ID;
      pricePerMonth = 10.0; // Exemple de prix
    } else if (plan === "premium") {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
      pricePerMonth = 20.0; // Exemple de prix
    } else {
      return res.status(400).json({ success: false, message: "Invalid plan type" });
    }

    if (![1, 3, 6, 12].includes(billingCycle)) {
      return res.status(400).json({ success: false, message: "Invalid billing cycle" });
    }

     // Calcul des dates d'essai
     const trialStart = new Date();
     const trialEnd = new Date();
     trialEnd.setMonth(trialEnd.getMonth() + billingCycle);

    // Créer un nouvel abonnement Stripe
    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    // Mettre à jour la base de données avec le nouvel abonnement
    await user.update({
      subscription_id: subscription.id,
      subscription_status: plan,
      billing_cycle: billingCycle,
      price_per_month: pricePerMonth,
      trial_start_date: trialStart,
      trial_end_date: trialEnd,
    });

    await envoyerEmail(
      user.email,
      "Subscription Renewal - ATPS",
      `<div>
          <h2>Subscription Renewed</h2>
          <p>Hello ${user.username},</p>
          <p>Your subscription to <strong>${plan}</strong> has been successfully renewed.</p>
          <p>Thank you for choosing ATPS.</p>
      </div>`
    );

    res.json({
      success: true,
      message: `Subscription renewed with plan ${plan} for ${billingCycle} months`,
    });
  } catch (error) {
    console.error("Error renewing subscription:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBillingPortal = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { clerkId: userId } });

    if (!user || !user.stripe_customer_id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User not found or missing Stripe customer ID",
        });
    }

    // Créer une session de portail client Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.FRONT_URL + "/user-profile",
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.checkTrialExpiration = async () => {
  try {
    const now = new Date();

    // Trouver tous les utilisateurs dont la période d'essai est terminée
    const expiredUsers = await User.findAll({
      where: {
        subscription_status: "trial",
        trial_end_date: { [Op.lt]: now }, // `Op.lt` = inférieur à `now`
      },
    });
    // Mettre à jour leur statut en `expired`
    for (const user of expiredUsers) {
      await user.update({ subscription_status: "expired" });
      console.log(`Utilisateur ${user.id} a terminé son essai.`);
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des périodes d'essai:", error);
  }
};
