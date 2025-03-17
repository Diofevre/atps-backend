module.exports = {
    "/forum-comment-reactions/react": {
      post: {
        tags: ["Forum Comment Reactions"],
        summary: "Ajouter ou modifier une réaction sur un commentaire",
        description:
          "Permet d'ajouter une réaction (like/dislike) à un commentaire. Si l'utilisateur a déjà réagi, la réaction est mise à jour. Si l'utilisateur clique à nouveau sur la même réaction, elle est supprimée.",
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                comment_id: {
                  type: "integer",
                  example: 1,
                  description: "ID du commentaire auquel l'utilisateur réagit.",
                },
                reaction_type: {
                  type: "string",
                  enum: ["like", "dislike"],
                  example: "like",
                  description: "Le type de réaction (like ou dislike).",
                },
              },
            },
          },
        ],
        responses: {
          201: {
            description: "Réaction ajoutée avec succès",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Réaction ajoutée",
                },
                reaction: {
                  $ref: "#/definitions/CommentReaction",
                },
              },
            },
          },
          200: {
            description: "Réaction mise à jour ou supprimée",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Réaction mise à jour",
                },
              },
            },
          },
          400: {
            description: "Données invalides",
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
    },
  
    "/forum-comment-reactions/count/{comment_id}": {
      get: {
        tags: ["Forum Comment Reactions"],
        summary: "Obtenir le nombre de likes et dislikes d'un commentaire",
        description:
          "Retourne le nombre de réactions (likes et dislikes) pour un commentaire donné.",
        parameters: [
          {
            name: "comment_id",
            in: "path",
            required: true,
            type: "integer",
            description: "ID du commentaire dont on veut obtenir les réactions.",
          },
        ],
        responses: {
          200: {
            description: "Réactions comptées avec succès",
            schema: {
              type: "object",
              properties: {
                comment_id: {
                  type: "integer",
                  example: 1,
                },
                likes: {
                  type: "integer",
                  example: 5,
                  description: "Nombre de likes pour le commentaire.",
                },
                dislikes: {
                  type: "integer",
                  example: 2,
                  description: "Nombre de dislikes pour le commentaire.",
                },
              },
            },
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
    },
  
    definitions: {
      CommentReaction: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          comment_id: {
            type: "integer",
            example: 1,
          },
          user_id: {
            type: "string",
            example: "user_12345",
          },
          reaction_type: {
            type: "string",
            enum: ["like", "dislike"],
            example: "like",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-02-06T14:20:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-02-06T14:25:00Z",
          },
        },
      },
    },
  };
  