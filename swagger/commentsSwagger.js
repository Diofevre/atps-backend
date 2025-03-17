module.exports = {
  "/comments/create": {
    post: {
      tags: ["Comments"],
      summary: "Créer un commentaire",
      description: "Crée un nouveau commentaire pour une question donnée.",
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
              questionId: {
                type: "integer",
                example: 123,
              },
              content: {
                type: "string",
                example: "Ceci est un commentaire.",
              },
            },
            required: ["userId", "questionId", "content"],
          },
        },
      ],
      responses: {
        201: {
          description: "Commentaire créé avec succès.",
          schema: {
            $ref: "##/definitions/Comment",
          },
        },
        400: {
          description: "Paramètres manquants.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },
  "/comments/update/{commentId}": {
    put: {
      tags: ["Comments"],
      summary: "Modifier un commentaire",
      description: "Met à jour le contenu d'un commentaire spécifique appartenant à l'utilisateur authentifié.",
      parameters: [
        {
          in: "path",
          name: "commentId",
          required: true,
          type: "string",
          example: "12345",
        },
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              content: {
                type: "string",
                example: "Commentaire mis à jour.",
              },
            },
            required: ["content"],
          },
        },
      ],
      responses: {
        200: {
          description: "Commentaire mis à jour avec succès.",
          schema: {
            $ref: "##/definitions/Comment",
          },
        },
        404: {
          description: "Commentaire introuvable ou non autorisé.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },
  "/comments/list/{questionId}": {
    get: {
      tags: ["Comments"],
      summary: "Lister les commentaires d'une question",
      description: "Retourne une liste de commentaires pour une question spécifique.",
      parameters: [
        {
          in: "path",
          name: "questionId",
          required: true,
          type: "string",
          example: "67890",
        },
      ],
      responses: {
        200: {
          description: "Liste des commentaires.",
          schema: {
            type: "array",
            items: {
              $ref: "##/definitions/CommentWithReactions",
            },
          },
        },
        400: {
          description: "ID de la question manquant.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },
  

  "/comments/{commentId}": {
    delete: {
      tags: ["Comments"],
      summary: "Supprimer un commentaire",
      description: "Supprime un commentaire spécifique appartenant à l'utilisateur authentifié.",
      parameters: [
        {
          in: "path",
          name: "commentId",
          required: true,
          type: "string",
          example: "12345",
        },
      ],
      responses: {
        200: {
          description: "Commentaire supprimé avec succès.",
        },
        404: {
          description: "Commentaire introuvable ou non autorisé.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },
  definitions: {
    Comment: {
      type: "object",
      properties: {
        id: {
          type: "string",
          example: "12345",
        },
        user_id: {
          type: "string",
          example: "54321",
        },
        question_id: {
          type: "string",
          example: "67890",
        },
        content: {
          type: "string",
          example: "Ceci est un commentaire.",
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
    CommentWithReactions: {
      type: "object",
      allOf: [
        {
          $ref: "#/definitions/Comment",
        },
        {
          type: "object",
          properties: {
            likes: {
              type: "integer",
              example: 10,
            },
            dislikes: {
              type: "integer",
              example: 2,
            },
          },
        },
      ],
    },
  },
};
