module.exports = {
    "/reactions/create": {
      post: {
        tags: ["Reactions"],
        summary: "Créer une réaction",
        description: "Ajoute une réaction (like ou dislike) à un commentaire spécifique.",
        parameters: [
          {
            in: "body",
            name: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  example: "12345",
                },
                commentId: {
                  type: "string",
                  example: "67890",
                },
                type: {
                  type: "string",
                  enum: ["like", "dislike"],
                  example: "like",
                },
              },
              required: ["userId", "commentId"],
            },
          },
        ],
        responses: {
          201: {
            description: "Réaction enregistrée avec succès.",
            schema: {
              $ref: "##/definitions/Reaction",
            },
          },
          400: {
            description: "Paramètres invalides ou manquants.",
          },
          500: {
            description: "Erreur interne du serveur.",
          },
        },
      },
    },
    definitions: {
      Reaction: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "abcdef123456",
          },
          user_id: {
            type: "string",
            example: "12345",
          },
          comment_id: {
            type: "string",
            example: "67890",
          },
          type: {
            type: "string",
            enum: ["like", "dislike"],
            example: "like",
          },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2024-12-01T12:00:00Z",
          },
          updated_at: {
            type: "string",
            format: "date-time",
            example: "2024-12-01T12:30:00Z",
          },
        },
      },
    },
  };
  