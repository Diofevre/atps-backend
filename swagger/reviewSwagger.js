module.exports = {
  "/reviews": {
    get: {
      tags: ["Reviews"],
      summary: "Récupérer tous les avis",
      description:
        "Cette route permet de récupérer la liste de tous les avis enregistrés.",
      responses: {
        200: {
          description: "Liste de tous les avis récupérée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/definitions/Review" },
              },
              example: [
                {
                  id: 1,
                  user_id: "user_67890",
                  question_id: 101,
                  country_seen: "France",
                  information: "Explication détaillée...",
                  info_accuracy: 4,
                  created_at: "2025-02-10T14:30:00Z",
                  updated_at: "2025-02-10T14:30:00Z",
                },
                {
                  id: 2,
                  user_id: "user_12345",
                  question_id: 102,
                  country_seen: "Canada",
                  information: "Autre explication...",
                  info_accuracy: 5,
                  created_at: "2025-02-11T10:00:00Z",
                  updated_at: "2025-02-11T10:00:00Z",
                },
              ],
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Erreur interne du serveur",
                  },
                },
              },
              example: {
                message: "Erreur interne du serveur",
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Reviews"],
      summary: "Créer un avis",
      description: "Ajoute un avis pour un pays visité par l'utilisateur.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              user_id: {
                type: "string",
                example: "user_2qmmaUfRB626gHnglkTsUcaDMji",
              },
              question_id: {
                type: "integer",
                example: 12345,
              },
              country_seen: {
                type: "string",
                example: "France",
              },
              information: {
                type: "string",
                example:
                  "Les monuments étaient incroyables, mais les files d'attente étaient longues.",
              },
              info_accuracy: {
                type: "number",
                format: "integer",
                example: 5,
              },
            },
            required: ["user_id", "question_id"],
          },
        },
      ],
      responses: {
        201: {
          description: "Avis créé avec succès.",
          schema: {
            $ref: "#/definitions/Review",
          },
        },
        400: {
          description: "Paramètres requis manquants.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },
  "/reviews/{reviewId}/seen": {
    put: {
      tags: ["Reviews"],
      summary: "Marquer une revue comme vue",
      description: "Cette route permet de marquer une revue spécifique comme vue en mettant à jour le champ `seen` à `true`.",
      parameters: [
        {
          in: "path",
          name: "reviewId",
          required: true,
          description: "L'ID unique de la revue à mettre à jour",
          schema: {
            type: "string",
            example: "1",
          },
        },
      ],
      responses: {
        200: {
          description: "La revue a été marquée comme vue avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "La revue a été marquée comme vue.",
                  },
                },
              },
              example: {
                message: "La revue a été marquée comme vue.",
              },
            },
          },
        },
        404: {
          description: "Revue non trouvée",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Revue non trouvée.",
                  },
                },
              },
              example: {
                message: "Revue non trouvée.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Erreur interne du serveur",
                  },
                },
              },
              example: {
                message: "Erreur interne du serveur",
              },
            },
          },
        },
      },
    },
  },
  definitions: {
    Review: {
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
        country_seen: {
          type: "string",
          example: "France",
        },
        information: {
          type: "string",
          example:
            "Les monuments étaient incroyables, mais les files d'attente étaient longues.",
        },
        info_accuracy: {
          type: "number",
          format: "float",
          example: 4.5,
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
