module.exports = {
    "/answers": {
      get: {
        tags: ["Tests"],
        summary: "Récupérer les réponses par statut (correctes ou incorrectes)",
        description: "Cette route permet de récupérer toutes les réponses d'un test, filtrées par leur statut (correctes ou incorrectes).",
        parameters: [
          {
            name: "testId",
            in: "query",
            required: true,
            description: "ID du test pour lequel récupérer les réponses",
            schema: {
              type: "integer",
              example: 123,
            },
          },
          {
            name: "isCorrect",
            in: "query",
            required: true,
            description: "Filtrer les réponses par statut (true pour correct, false pour incorrect)",
            schema: {
              type: "boolean",
              example: true,
            },
          },
        ],
        responses: {
          200: {
            description: "Réponses récupérées avec succès.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Answers retrieved successfully for testId 123.",
                    },
                    total: {
                      type: "integer",
                      example: 5,
                    },
                    answers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          questionId: {
                            type: "integer",
                            example: 1,
                          },
                          questionText: {
                            type: "string",
                            example: "What is the capital of France?",
                          },
                          userAnswer: {
                            type: "string",
                            example: "Paris",
                          },
                          isCorrect: {
                            type: "boolean",
                            example: true,
                          },
                          correctAnswer: {
                            type: "string",
                            example: null,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Requête invalide. Paramètres manquants ou incorrects.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Invalid input. Please provide testId and isCorrect (true or false).",
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
                      example: "An error occurred while fetching answers.",
                    },
                    error: {
                      type: "string",
                      example: "Détails de l'erreur.",
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
  