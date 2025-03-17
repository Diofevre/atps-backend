const nodemailer = require("nodemailer");

// Configurer le transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, 
  port: process.env.MAIL_PORT, 
  secure: true, 
  auth: {
    user: process.env.MAIL_USERNAME, 
    pass: process.env.MAIL_PASSWORD, 
  },
});

// Fonction pour envoyer un email
const envoyerEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // Nom et adresse email
      to, 
      subject,  
      html, 
    });

    console.log("Email envoyé avec succès :", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw error;
  }
};

module.exports = { envoyerEmail };
