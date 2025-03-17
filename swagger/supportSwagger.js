module.exports = {
    "/support/tickets": {
      post: {
        tags: ["Support"],
        summary: "Créer un ticket de support",
        description: "Permet à un utilisateur de créer un ticket avec un premier message.",
        parameters: [
          {
            in: "body",
            name: "body",
            required: true,
            description: "Informations du ticket",
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email", example: "user@example.com" },
                subject: { type: "string", example: "Problème avec mon compte" },
                content: { type: "string", example: "Je ne peux pas accéder à mon compte." },
                attachment: {
                  type: "array",
                  items: { type: "string", format: "url" },
                  example: ["https://example.com/file1.pdf", "https://example.com/file2.png"],
                },
              },
              required: ["email", "subject", "content"],
            },
          },
        ],
        responses: {
          201: { description: "Ticket créé avec succès" },
          500: { description: "Erreur interne du serveur" },
        },
      },
      
    },
  "/support/tickets/me": {
    get: {
        tags: ["Support"],
        summary: "Obtenir les tickets de l'utilisateur",
        description: "Retourne la liste des tickets créés par l'utilisateur connecté.",
        responses: {
          200: { description: "Liste des tickets de l'utilisateur" },
          500: { description: "Erreur interne du serveur" },
        },
      },
  },
    "/support/tickets/{ticketId}/messages": {
      post: {
        tags: ["Support"],
        summary: "Envoyer un message sur un ticket existant",
        description: "Permet à un utilisateur d'envoyer un message sur un ticket ouvert.",
        parameters: [
          { in: "path", name: "ticketId", required: true, type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
          {
            in: "body",
            name: "body",
            required: true,
            description: "Contenu du message",
            schema: {
              type: "object",
              properties: {
                content: { type: "string", example: "Pouvez-vous m'aider avec ce problème ?" },
                attachment: {
                  type: "array",
                  items: { type: "string", format: "url" },
                  example: ["https://example.com/file1.pdf", "https://example.com/file2.png"],
                },
              },
              required: ["content"],
            },
          },
        ],
        responses: {
          201: { description: "Message envoyé avec succès" },
          404: { description: "Ticket introuvable" },
          500: { description: "Erreur interne du serveur" },
        },
      },
      get: {
        tags: ["Support"],
        summary: "Obtenir les messages d'un ticket",
        description: "Retourne tous les messages échangés pour un ticket donné.",
        parameters: [
          { in: "path", name: "ticketId", required: true, type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
        ],
        responses: {
          200: { description: "Liste des messages du ticket" },
          404: { description: "Ticket introuvable" },
          500: { description: "Erreur interne du serveur" },
        },
      },
    },
  
    "/support/tickets/all": {
      get: {
        tags: ["Support"],
        summary: "Obtenir tous les tickets (Admin)",
        description: "Retourne tous les tickets du support. Accessible uniquement aux administrateurs.",
        responses: {
          200: { description: "Liste des tickets" },
          500: { description: "Erreur interne du serveur" },
        },
      },
    },
  
    "/support/tickets/{ticketId}/admin-reply": {
      post: {
        tags: ["Support"],
        summary: "Répondre à un ticket (Admin)",
        description: "Permet à un administrateur de répondre à un ticket de support.",
        parameters: [
          { in: "path", name: "ticketId", required: true, type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
          {
            in: "body",
            name: "body",
            required: true,
            description: "Contenu de la réponse",
            schema: {
              type: "object",
              properties: {
                content: { type: "string", example: "Merci pour votre patience, voici la solution..." },
                attachment: {
                  type: "array",
                  items: { type: "string", format: "url" },
                  example: ["https://example.com/solution.pdf"],
                },
              },
              required: ["content"],
            },
          },
        ],
        responses: {
          201: { description: "Réponse envoyée avec succès" },
          404: { description: "Ticket introuvable" },
          500: { description: "Erreur interne du serveur" },
        },
      },
    },
  
    definitions: {
      SupportTicket: {
        type: "object",
        properties: {
          id: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
          userId: { type: "string", example: "user_98765" },
          email: { type: "string", format: "email", example: "user@example.com" },
          subject: { type: "string", example: "Problème technique" },
          status: { type: "string", enum: ["open", "pending", "closed"], example: "open" },
          createdAt: { type: "string", format: "date-time", example: "2024-12-01T12:00:00Z" },
        },
      },
      SupportMessage: {
        type: "object",
        properties: {
          id: { type: "string", example: "msg_123456" },
          ticketId: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
          sender: { type: "string", enum: ["user", "admin"], example: "user" },
          content: { type: "string", example: "J'ai un problème avec mon compte." },
          attachment: {
            type: "array",
            items: { type: "string", format: "url" },
            example: ["https://example.com/image1.jpg", "https://example.com/image2.png"],
          },
          createdAt: { type: "string", format: "date-time", example: "2024-12-01T12:00:00Z" },
        },
      },
    },
  };
  