module.exports = {
    "/latest-news": {
      get: {
        tags: ["News"],
        summary: "Récupérer les 5 dernières actualités reformulées",
        description: "Renvoie les articles les plus récents avec leur contenu entièrement reformulé par l'IA.",
        responses: {
          200: {
            description: "Les dernières actualités ont été récupérées avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    articles: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string", example: "Titre de l'article" },
                          link: { type: "string", example: "https://exemple.com/article" },
                          pubDate: { type: "string", format: "date-time", example: "2024-02-18T10:00:00Z" },
                          image: { type: "string", example: "https://exemple.com/image.jpg" },
                          content: { type: "string", example: "Contenu reformulé de l'article..." },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Aucun article trouvé ou erreur de récupération.",
          },
          500: {
            description: "Erreur interne du serveur.",
          },
        },
      },
    },
  /*
    "/latest-news/link": {
      get: {
        tags: ["News"],
        summary: "Récupérer un article spécifique avec son contenu reformulé",
        description: "Récupère un article à partir de son lien, reformule son contenu et retourne aussi les 3 autres articles récents (titre, image, date).",
        parameters: [
          {
            name: "link",
            in: "query",
            required: true,
            description: "URL de l'article à récupérer",
            schema: {
              type: "string",
              example: "https://exemple.com/article123",
            },
          },
        ],
        responses: {
          200: {
            description: "L'article a été récupéré avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    article: {
                      type: "object",
                      properties: {
                        title: { type: "string", example: "Titre de l'article sélectionné" },
                        link: { type: "string", example: "https://exemple.com/article123" },
                        pubDate: { type: "string", format: "date-time", example: "2025-02-18T12:00:00.000Z" },
                        content: { type: "string", example: "Contenu reformulé..." },
                        image: { type: "string", example: "https://exemple.com/image.jpg" },
                      },
                    },
                    recentArticles: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string", example: "Autre article 1" },
                          link: { type: "string", example: "https://exemple.com/article1" },
                          pubDate: { type: "string", format: "date-time", example: "2025-02-17T10:00:00.000Z" },
                          image: { type: "string", example: "https://exemple.com/image1.jpg" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Lien manquant ou article introuvable.",
          },
          500: {
            description: "Erreur interne du serveur.",
          },
        },
      },
    },*/
  };
  