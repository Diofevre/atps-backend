module.exports = {
  "/forum-categories": {
    get: {
      tags: ["Forum Categories"],
      summary: "Récupérer toutes les catégories de forum",
      description: "Retourne une liste de toutes les catégories de forum",
      responses: {
        200: {
          description: "Liste des catégories de forum",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/ForumCategory",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    post: {
      tags: ["Forum Categories"],
      summary: "Créer une nouvelle catégorie de forum",
      description: "Permet de créer une nouvelle catégorie de forum",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "Sports",
                description: "Nom de la catégorie de forum",
              },
            },
          },
        },
      ],
      responses: {
        201: {
          description: "Catégorie créée avec succès",
          schema: {
            $ref: "#/definitions/ForumCategory",
          },
        },
        400: {
          description: "Nom de la catégorie requis",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },

  definitions: {
    ForumCategory: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 1,
        },
        name: {
          type: "string",
          example: "Sports",
        },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2025-02-05T12:00:00Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2025-02-05T12:00:00Z",
        },
        deleted_at: {
          type: "string",
          format: "date-time",
          example: null,
        },
      },
    },
  },
};
