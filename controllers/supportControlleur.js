const { SupportTicket, SupportMessage } = require("../models");
const { envoyerEmail } = require("../services/emailService");

exports.createTicket = async (req, res) => {
  try {
    const { email, subject, content, attachment } = req.body;
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Vérifier que l'attachement est bien un tableau
    const attachments = Array.isArray(attachment) ? attachment : [];

    const ticket = await SupportTicket.create({
      userId,
      email,
      subject,
      status: "open",
    });

    await SupportMessage.create({
      ticketId: ticket.id,
      sender: "user",
      content,
      attachment: attachments,
    });

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const tickets = await SupportTicket.findAll({ where: { userId } });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content, attachment } = req.body;
    const userId = req.auth.userId;

    const ticket = await SupportTicket.findOne({ where: { id: ticketId, userId } });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const attachments = Array.isArray(attachment) ? attachment : [];

    const message = await SupportMessage.create({
      ticketId,
      sender: "user",
      content,
      attachment: attachments,
    });

    res.status(201).json({ message: "Message sent", message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTicketMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.auth.userId;

    const ticket = await SupportTicket.findOne({ where: { id: ticketId, userId } });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const messages = await SupportMessage.findAll({ where: { ticketId } });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll();
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.adminReply = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content, attachment } = req.body;

    const ticket = await SupportTicket.findOne({ where: { id: ticketId } });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const attachments = Array.isArray(attachment) ? attachment : [];

    const message = await SupportMessage.create({
      ticketId,
      sender: "admin",
      content,
      attachment: attachments,
    });

    await envoyerEmail(ticket.email, "Support Reply", `Your support request has a new reply:\n\n${content}`);

    res.status(201).json({ message: "Reply sent", message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
