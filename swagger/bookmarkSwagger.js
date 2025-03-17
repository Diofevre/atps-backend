module.exports = {
    "/bookmarks": {
      post: {
        summary: "Créer ou mettre à jour un bookmark",
        description:
          "Permet de créer ou de mettre à jour l'état d'un bookmark pour une page spécifique. Si le bookmark existe, son état sera inversé. Sinon, un nouveau bookmark sera créé.",
        tags: ["Bookmarks"],
        parameters: [
            {
              in: "body",
              name: "body",
              required: true,
              schema: {
                type: "object",
                properties: {
                  page_id: {
                    type: "integer",
                    description: "Identifiant unique de la page à bookmarker",
                    example: 42,
                  },
                },
                required: ["page_id"],
              },
            },
        ],
        responses: {
          200: {
            description: "Bookmark mis à jour avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Bookmark mis à jour avec succès.",
                    },
                    bookmarked: {
                      type: "boolean",
                      description: "Indique si la page est actuellement bookmarkée.",
                      example: true,
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "L'identifiant de la page est requis.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "L'identifiant de la page est requis.",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur interne du serveur.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Une erreur s'est produite.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  