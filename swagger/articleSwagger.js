module.exports = {
    "/articles": {
      post: {
        tags: ["Articles"],
        summary: "Créer un article avec ses sections",
        description: "Crée un nouvel article avec des sections associées.",
        parameters: [
          {
            in: "body",
            name: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  example: "Chart Your Course: 8 Steps to Choosing the Perfect Flight School",
                },
                title_image: {
                  type: "string",
                  example: "image1.png",
                },
                title_text: {
                  type: "string",
                  example: "Embarking on your aviation journey is thrilling...",
                },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      heading: {
                        type: "string",
                        example: "1. Define Your Pilot Vision",
                      },
                      section_image: {
                        type: "string",
                        example: "image2.png",
                      },
                      section_text: {
                        type: "string",
                        example: "Start with clarity. Ask yourself...",
                      },
                    },
                    required: ["heading", "section_text"],
                  },
                },
              },
              required: ["title", "title_text"],
            },
          },
        ],
        responses: {
          201: {
            description: "Article créé avec succès.",
            schema: {
              $ref: "#/definitions/Article",
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
      get: {
        tags: ["Articles"],
        summary: "Lister tous les articles avec leurs sections",
        description: "Retourne une liste de tous les articles avec leurs sections associées.",
        responses: {
          200: {
            description: "Liste des articles.",
            schema: {
              type: "array",
              items: {
                $ref: "##/definitions/ArticleWithSections",
              },
            },
          },
          500: {
            description: "Erreur interne du serveur.",
          },
        },
      },
    },
  
    "/articles/{id}": {
      get: {
        tags: ["Articles"],
        summary: "Récupérer un article avec ses sections",
        description: "Retourne un article spécifique avec toutes ses sections.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            type: "integer",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Article trouvé.",
            schema: {
              $ref: "##/definitions/ArticleWithSections",
            },
          },
          404: {
            description: "Article non trouvé.",
          },
          500: {
            description: "Erreur interne du serveur.",
          },
        },
      },
  
      put: {
        tags: ["Articles"],
        summary: "Mettre à jour un article et ses sections",
        description: "Met à jour un article et remplace ses sections existantes par les nouvelles.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            type: "integer",
            example: 1,
          },
          {
            in: "body",
            name: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  example: "Updated Title",
                },
                title_image: {
                  type: "string",
                  example: "updated_image.png",
                },
                title_text: {
                  type: "string",
                  example: "Updated text...",
                },
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      heading: {
                        type: "string",
                        example: "Updated Section Heading",
                      },
                      section_image: {
                        type: "string",
                        example: "new_image.png",
                      },
                      section_text: {
                        type: "string",
                        example: "Updated section text...",
                      },
                    },
                    required: ["heading", "section_text"],
                  },
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "Article mis à jour avec succès.",
          },
          404: {
            description: "Article non trouvé.",
          },
          500: {
            description: "Erreur interne du serveur.",
          },
        },
      },
  
      delete: {
        tags: ["Articles"],
        summary: "Supprimer un article et ses sections",
        description: "Supprime un article et toutes ses sections associées.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            type: "integer",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Article supprimé avec succès.",
          },
          404: {
            description: "Article non trouvé.",
          },
          500: {
            description: "Erreur interne du serveur.",
          },
        },
      },
    },
  
  
    definitions: {
      Article: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          title: {
            type: "string",
            example: "Chart Your Course: 8 Steps to Choosing the Perfect Flight School",
          },
          title_image: {
            type: "string",
            example: "image1.png",
          },
          title_text: {
            type: "string",
            example: "Embarking on your aviation journey is thrilling...",
          },
        },
      },
  
      Section: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 101,
          },
          article_id: {
            type: "integer",
            example: 1,
          },
          heading: {
            type: "string",
            example: "1. Define Your Pilot Vision",
          },
          section_image: {
            type: "string",
            example: "image2.png",
          },
          section_text: {
            type: "string",
            example: "Start with clarity. Ask yourself...",
          },
        },
      },
  
      ArticleWithSections: {
        type: "object",
        allOf: [
          {
            $ref: "#/definitions/Article",
          },
          {
            type: "object",
            properties: {
              sections: {
                type: "array",
                items: {
                  $ref: "#/definitions/Section",
                },
              },
            },
          },
        ],
      },
    },
  };
  