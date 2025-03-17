module.exports = {
  "/forum-hashtags": {
    get: {
      tags: ["Forum Hashtags"],
      summary: "Récupérer tous les hashtags",
      description: "Retourne une liste de tous les hashtags",
      responses: {
        200: {
          description: "Liste des hashtags",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/Hashtag",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    post: {
      tags: ["Forum Hashtags"],
      summary: "Créer un nouveau hashtag",
      description:
        "Permet de créer un nouveau hashtag. Si le hashtag existe déjà, une erreur est renvoyée. Le caractère '#' sera ajouté au nom si nécessaire.",
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
                example: "sports",
                description:
                  "Nom du hashtag sans le caractère '#' (sera ajouté si nécessaire)",
              },
            },
          },
        },
      ],
      responses: {
        201: {
          description: "Hashtag créé avec succès",
          schema: {
            $ref: "#/definitions/Hashtag",
          },
        },
        400: {
          description: "Le hashtag existe déjà",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },
  "/forum-hashtags/popular": {
    get: {
      tags: ["Forum Hashtags"],
      summary: "Récupérer les hashtags les plus populaires",
      description: "Retourne une liste des hashtags les plus utilisés dans les posts.",
      responses: {
        200: {
          description: "Liste des hashtags populaires",
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "#sport"
                },
                usage_count: {
                  type: "integer",
                  example: 15,
                  description: "Nombre d'utilisations de ce hashtag."
                }
              }
            }
          }
        },
        500: {
          description: "Erreur interne du serveur"
        }
      }
    }
  },

  definitions: {
    Hashtag: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 1,
        },
        name: {
          type: "string",
          example: "#sports",
        },
      },
    },
  },
};
