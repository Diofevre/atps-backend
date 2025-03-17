module.exports = {
    "/forum-post-reactions/react": {
      post: {
        tags: ["Forum Post Reactions"],
        summary: "Ajouter ou modifier une réaction sur un post",
        description:
          "Permet d'ajouter une réaction (like/dislike) à un post. Si l'utilisateur a déjà réagi, la réaction est mise à jour. Si l'utilisateur clique à nouveau sur la même réaction, elle est supprimée.",
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                post_id: {
                  type: "integer",
                  example: 1,
                  description: "ID du post auquel l'utilisateur réagit.",
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
          200: {
            description: "Réaction ajoutée ou mise à jour avec succès",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Réaction ajoutée",
                },
                reaction: {
                  $ref: "#/definitions/PostReaction",
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
  
    "/forum-post-reactions/count/{post_id}": {
      get: {
        tags: ["Forum Post Reactions"],
        summary: "Obtenir le nombre de likes et dislikes d'un post",
        description:
          "Retourne le nombre de réactions (likes et dislikes) pour un post donné.",
        parameters: [
          {
            name: "post_id",
            in: "path",
            required: true,
            type: "integer",
            description: "ID du post dont on veut obtenir les réactions.",
          },
        ],
        responses: {
          200: {
            description: "Réactions comptées avec succès",
            schema: {
              type: "object",
              properties: {
                post_id: {
                  type: "integer",
                  example: 1,
                },
                likes: {
                  type: "integer",
                  example: 10,
                  description: "Nombre de likes pour le post.",
                },
                dislikes: {
                  type: "integer",
                  example: 3,
                  description: "Nombre de dislikes pour le post.",
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
      PostReaction: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          post_id: {
            type: "integer",
            example: 1,
          },
          user_id: {
            type: "integer",
            example: 101,
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
  