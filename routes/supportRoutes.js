const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportControlleur");

// 📌 Routes pour les utilisateurs
router.post("/", supportController.createTicket); // Créer un ticket
router.post("/:ticketId/messages", supportController.sendMessage); // Envoyer un message
router.get("/me", supportController.getUserTickets); // Voir ses tickets
router.get("/:ticketId/messages", supportController.getTicketMessages); // Voir les messages d'un ticket

// 📌 Routes pour les admins
router.get("/all", supportController.getAllTickets); // Voir tous les tickets
router.post("/:ticketId/admin-reply", supportController.adminReply); // Répondre à un ticket

module.exports = router;
