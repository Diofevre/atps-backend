module.exports = {
  "/tests/start": {
    post: {
      tags: ["Tests"],
      summary: "Récupère des questions",
      description: "Récupère des questions aléatoires.",
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
                example: "user_2qlsoyDcuM1mk3dfCaRB6fCjaYe",
                description: "ID de l'utilisateur qui lance le test",
              },
              testId: {
                type: "integer",
                example: null,
                description: "ID du test existant",
              },
              tryagainfilter: {
                type: "string",
                example: null,
                description: "filtre pour refaire le test",
              },
              nombre_question: {
                type: "integer",
                example: null,
                description: "nombre de question pour le test à refaire",
              },
              total_question: {
                type: "integer",
                example: 10,
                description: "Nombre total de questions",
              },
              sub_chapters: {
                type: "array",
                items: { type: "integer" },
                example: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                description: "Liste des IDs des sous-chapitres sélectionnés",
              },
              filter: {
                type: "object",
                properties: {
                  countries: {
                    type: "string",
                    example: null,
                    description: "Pays spécifié",
                  },
                  question_not_seen: {
                    type: "boolean",
                    example: false,
                    description: "Examens non vus",
                  },
                  green_tag: {
                    type: "boolean",
                    example: false,
                    description: "Tag vert",
                  },
                  red_tag: {
                    type: "boolean",
                    example: false,
                    description: "Tag rouge",
                  },
                  orange_tag: {
                    type: "boolean",
                    example: false,
                    description: "Tag orange",
                  },
                  wrong_answer: {
                    type: "boolean",
                    example: false,
                    description: "Réponses incorrectes",
                  },
                  last_exam: {
                    type: "integer",
                    example: 200,
                    description: "Dernier examen",
                  },
                },
              },
            },
            required: ["userId", "total_question", "sub_chapters", "filter"],
          },
        },
      ],
      responses: {
        200: {
          description: "Questions récupérées avec succès.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  test_id: {
                    type: "integer",
                    example: 123,
                  },
                  topic_name: {
                    type: "string",
                    example: "Air Law",
                  },
                  total_question: {
                    type: "integer",
                    example: 2,
                  },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 11 },
                        user_id: {
                          type: "string",
                          example: "user_2qlsoyDcuM1mk3dfCaRB6fCjaYe",
                        },
                        question_id: { type: "integer", example: 303 },
                        testSubChapter_id: { type: "integer", example: 3 },
                        user_answer: { type: "string", example: null },
                        is_correct: { type: "boolean", example: null },
                        created_at: {
                          type: "string",
                          format: "date-time",
                          example: "2024-12-27T03:24:36.000Z",
                        },
                        updated_at: {
                          type: "string",
                          format: "date-time",
                          example: "2024-12-27T03:24:36.000Z",
                        },
                        questions: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 303 },
                            question_text: {
                              type: "string",
                              example: "What is the capital of France?",
                            },
                            answer: { type: "string", example: "A" },
                            options: {
                              type: "object",
                              additionalProperties: { type: "string" },
                              example: {
                                A: "Paris",
                                B: "London",
                                C: "Rome",
                                D: "Madrid",
                              },
                            },
                            explanation: {
                              type: "string",
                              example: "Paris est la capitale de la France.",
                            },
                            sub_chapter_id: { type: "integer", example: 6 },
                            sub_chapter: {
                              type: "object",
                              properties: {
                                sub_chapter_text: {
                                  type: "string",
                                  example:
                                    "031-04-01 - Contents of mass-and-balance documentation",
                                },
                              },
                            },
                          },
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
                  message: { type: "string", example: "Invalid input." },
                },
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
                  message: { type: "string", example: "An error occurred." },
                },
              },
            },
          },
        },
      },
    },
  },

  "/tests/validate": {
    post: {
      tags: ["Tests"],
      summary: "Valider un test",
      description:
        "Valide un test, calcule les statistiques (correct, incorrect, non répondu) et marque le test comme terminé.",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              testId: {
                type: "integer",
                example: 135,
                description: "ID du test à valider",
              },
              filter: {
                type: "string",
                example: null,
                description:
                  "Filtrer les résultats par 'correct' ou 'incorrect' ou no-answer ou pinned",
                default: null,
              },
            },
            required: ["testId"],
          },
        },
      ],
      responses: {
        200: {
          description: "Validation du test réussie.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Validation completed successfully.",
              },
              testId: {
                type: "integer",
                example: 123,
              },
              timeSpent: {
                type: "string",
                example: "00:25:15",
              },
              dateOfValidation: {
                type: "string",
                example: "2023-12-31T23:59:59.000Z",
              },
              totalQuestions: {
                type: "integer",
                example: 10,
              },
              correctAnswers: {
                type: "integer",
                example: 7,
              },
              incorrectAnswers: {
                type: "integer",
                example: 2,
              },
              notAnswered: {
                type: "integer",
                example: 1,
              },
              red: {
                type: "integer",
                example: 1,
              },
              green: {
                type: "integer",
                example: 1,
              },
              orange: {
                type: "integer",
                example: 1,
              },
              scorePercentage: {
                type: "string",
                example: "70.00",
              },
              topic: {
                type: "string",
                example: "Mathematics",
              },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionId: {
                      type: "integer",
                      example: 101,
                    },
                    questionText: {
                      type: "string",
                      example: "What is 2 + 2?",
                    },
                    userAnswer: {
                      type: "string",
                      example: "4",
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
        400: {
          description: "Requête invalide.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Invalid input.",
              },
            },
          },
        },
        404: {
          description: "Test non trouvé.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Test not found.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred during answer validation.",
              },
              error: {
                type: "string",
                example: "Details of the error.",
              },
            },
          },
        },
      },
    },
  },
  
  "/tests/saveTest": {
    post: {
      tags: ["Tests"],
      summary: "Enregistremet d'un test",
      description:
        "Enregistremet d'un test en mettant à jour le temps passé et le nombre de questions terminées pour un test spécifique.",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              testId: {
                type: "integer",
                example: 1,
                description: "ID du test à mettre à jour",
              },  
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question_id: {
                      type: "integer",
                      example: 101,
                      description: "ID de la question",
                    },
                    user_answer: {
                      type: "string",
                      example: "A",
                      description: "Réponse de l'utilisateur à la question",
                    },
                  },
                  required: ["question_id", "user_answer"],
                },
              },
            },
            required: ["testId", "finished_question"],
          },
        },
      ],
      responses: {
        200: {
          description: "Test mis à jour avec succès.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Test updated successfully.",
              },
            },
          },
        },
        400: {
          description: "Requête invalide. Paramètres manquants ou incorrects.",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "Invalid input." },
            },
          },
        },
        404: {
          description: "Test non trouvé.",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "Test not found." },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur.",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "An error occurred." },
              error: { type: "string", example: "Détails de l'erreur." },
            },
          },
        },
      },
    },
  },
  "/tests/validate": {
    post: {
      tags: ["Tests"],
      summary: "Valider un test",
      description:
        "Valide un test, calcule les statistiques (correct, incorrect, non répondu) et marque le test comme terminé.",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              testId: {
                type: "integer",
                example: 135,
                description: "ID du test à valider",
              },
              filter: {
                type: "string",
                example: null,
                description:
                  "Filtrer les résultats par 'correct', 'incorrect', 'no-answer', 'pinned', 'red', 'green', ou 'orange'.",
                default: null,
              },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question_id: {
                      type: "integer",
                      example: 101,
                      description: "ID de la question",
                    },
                    user_answer: {
                      type: "string",
                      example: "A",
                      description: "Réponse de l'utilisateur à la question",
                    },
                  },
                  required: ["question_id", "user_answer"],
                },
              },
            },
            required: ["testId", "data"],
          },
        },
      ],
      responses: {
        200: {
          description: "Validation du test réussie.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Validation completed successfully.",
              },
              testId: {
                type: "integer",
                example: 123,
              },
              timeSpent: {
                type: "string",
                example: "00:25:15",
              },
              dateOfValidation: {
                type: "string",
                example: "2023-12-31T23:59:59.000Z",
              },
              totalQuestions: {
                type: "integer",
                example: 10,
              },
              correctAnswers: {
                type: "integer",
                example: 7,
              },
              incorrectAnswers: {
                type: "integer",
                example: 2,
              },
              notAnswered: {
                type: "integer",
                example: 1,
              },
              red: {
                type: "integer",
                example: 1,
              },
              green: {
                type: "integer",
                example: 1,
              },
              orange: {
                type: "integer",
                example: 1,
              },
              scorePercentage: {
                type: "string",
                example: "70.00",
              },
              topic: {
                type: "string",
                example: "Mathematics",
              },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionId: {
                      type: "integer",
                      example: 101,
                    },
                    questionText: {
                      type: "string",
                      example: "What is 2 + 2?",
                    },
                    userAnswer: {
                      type: "string",
                      example: "4: Four",
                    },
                    isCorrect: {
                      type: "boolean",
                      example: true,
                    },
                    isPinned: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      example: ["red"],
                    },
                    correctAnswer: {
                      type: "string",
                      example: "4: Four",
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Requête invalide.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Invalid input.",
              },
            },
          },
        },
        404: {
          description: "Test ou question non trouvé.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Test not found.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred during answer validation.",
              },
              error: {
                type: "string",
                example: "Details of the error.",
              },
            },
          },
        },
      },
    },
  },

  "/tests/list/{userId}": {
    get: {
      tags: ["Tests"],
      summary: "Liste des tests non terminés pour un utilisateur",
      description:
        "Récupère tous les tests non terminés pour un utilisateur spécifique.",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          type: "string",
          example: "user_2qlsoyDcuM1mk3dfCaRB6fCjaYe",
          description:
            "ID de l'utilisateur pour lequel récupérer les tests non terminés",
        },
      ],
      responses: {
        200: {
          description: "Tests non terminés récupérés avec succès.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Unfinished tests retrieved successfully.",
              },
              unfinishedTests: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    test_id: { type: "integer", example: 123 },
                    total_question: { type: "integer", example: 10 },
                    finished_question: { type: "integer", example: 5 },
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          user_id: {
                            type: "string",
                            example: "user_2qlsoyDcuM1mk3dfCaRB6fCjaYe",
                          },
                          question_id: { type: "integer", example: 101 },
                          testSubChapter_id: { type: "integer", example: 5 },
                          user_answer: { type: "string", example: "A" },
                          is_correct: { type: "boolean", example: true },
                          created_at: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-01T00:00:00Z",
                          },
                          updated_at: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-02T00:00:00Z",
                          },
                          questions: {
                            type: "object",
                            properties: {
                              id: { type: "integer", example: 101 },
                              question_text: {
                                type: "string",
                                example: "What is the capital of France?",
                              },
                              answer: { type: "string", example: "Paris" },
                              options: {
                                type: "object",
                                additionalProperties: { type: "string" },
                                example: {
                                  A: "Paris",
                                  B: "London",
                                  C: "Rome",
                                  D: "Madrid",
                                },
                              },
                              explanation: {
                                type: "string",
                                example: "Paris is the capital city of France.",
                              },
                              sub_chapter_id: { type: "integer", example: 1 },
                              sub_chapter: {
                                type: "object",
                                properties: {
                                  sub_chapter_text: {
                                    type: "string",
                                    example: "Geography - Capitals",
                                  },
                                },
                              },
                            },
                          },
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
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Invalid input.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred while fetching unfinished tests.",
              },
              error: {
                type: "string",
                example: "Error details here.",
              },
            },
          },
        },
      },
    },
  },

  "/tests/continueTest/{testId}": {
    get: {
      tags: ["Tests"],
      summary: "Continuer un test  existant",
      description: "Continuer un test existant avec son testId donné.",
      parameters: [
        {
          name: "testId",
          in: "path",
          required: true,
          type: "string",
          example: "123",
          description: "ID du test à continuer",
        },
      ],
      responses: {
        200: {
          description: "Test continued successfully.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Test continued successfully.",
              },
            },
          },
        },
        400: {
          description: "Missing required parameter",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Missing required parameter: testId",
              },
            },
          },
        },
        500: {
          description: "Internal server error",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred while continuing the test.",
              },
              error: {
                type: "string",
                example: "Detailed error message here.",
              },
            },
          },
        },
      },
    },
  },

  "/tests/supprimeTest": {
    delete: {
      tags: ["Tests"],
      summary: "Supprimer plusieurs tests",
      description:
        "Supprime un ou plusieurs tests en fonction des IDs fournis.",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              testIds: {
                type: "array",
                items: {
                  type: "integer",
                },
                example: [1, 2, 3], // Exemple d'IDs de tests à supprimer
                description: "Liste des IDs des tests à supprimer",
              },
            },
          },
        },
      ],
      responses: {
        200: {
          description: "Tests et données associées supprimés avec succès.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Tests and related data deleted successfully",
              },
            },
          },
        },
        400: {
          description: "Paramètre manquant ou incorrect.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example:
                  "Missing required parameter: testIds (must be an array)",
              },
            },
          },
        },
        404: {
          description: "Un ou plusieurs tests non trouvés.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "One or more tests not found",
              },
            },
          },
        },
        409: {
          description:
            "Conflit lors de la suppression en raison de dépendances existantes.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Cannot delete tests due to existing dependencies",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred while deleting the tests",
              },
              error: {
                type: "string",
                example: "Message d'erreur détaillé ici.",
              },
            },
          },
        },
      },
    },
  },

  "/tests/resumeTest": {
    get: {
      tags: ["Tests"],
      summary: "Reprendre le dernier test",
      description: "Récupère le dernier test pour l'utilisateur authentifié.",
      responses: {
        200: {
          description: "Le dernier test a été récupéré avec succès.",
          schema: {
            type: "object",
            properties: {
              test_id: {
                type: "integer",
                example: 123, // Exemple d'ID de test
              },
              timespent: {
                type: "string",
                example: "00:30:15", // Exemple de temps passé
              },
              total_question: {
                type: "integer",
                example: 10, // Exemple du nombre total de questions
              },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      example: 1, // Exemple d'ID de question
                    },
                    question_text: {
                      type: "string",
                      example: "What is the capital of France?", // Exemple de texte de question
                    },
                    user_answer: {
                      type: "string",
                      example: "Paris", // Exemple de réponse de l'utilisateur
                    },
                    is_correct: {
                      type: "boolean",
                      example: true, // Exemple de statut de réponse correcte
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Aucun test trouvé pour l'utilisateur authentifié.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "No tests found for the authenticated user.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred while handling the existing test.",
              },
              error: {
                type: "string",
                example: "Message d'erreur détaillé ici.",
              },
            },
          },
        },
      },
    },
  },

  "/tests/count-unfinished": {
    get: {
      tags: ["Tests"],
      summary: "Compter les tests non terminés",
      description:
        "Récupère le nombre de tests non terminés pour l'utilisateur authentifié, basé sur `is_finished`",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Nombre de tests non terminés récupéré avec succès.",
          schema: {
            type: "object",
            properties: {
              count: {
                type: "integer",
                example: 2,
                description: "Nombre de tests non terminés.",
              },
            },
          },
        },
        401: {
          description: "Utilisateur non authentifié.",
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "User not authenticated",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred while counting unfinished tests.",
              },
              error: {
                type: "string",
                example: "Détails de l'erreur ici.",
              },
            },
          },
        },
      },
    },
  },

  "/tests/search/{keyword}/{country}/{topic_id}/{last_exam}": {
    get: {
      tags: ["Tests"],
      summary: "Récupère des questions par filtre",
      description: "Récupère des questions filtrées par mot-clé, pays, topic et dernier examen.",
      parameters: [
        {
          in: "path",
          name: "keyword",
          description: "Mot-clé pour la recherche de questions",
          schema: { type: "string"},
        },
        {
          in: "path",
          name: "country",
          description: "Pays de la question",
          schema: { type: "string" },
        },
        {
          in: "path",
          name: "topic_id",
          description: "ID du topic",
          schema: { type: "integer" },
        },
        {
          in: "path",
          name: "last_exam",
          description: "Dernier examen (boolean)",
          schema: { type: "boolean" },
        },
      ],
      responses: {
        200: {
          description: "Questions récupérées avec succès.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_question: { type: "integer", example: 10 },
                  sub_chapter_ids: {
                    type: "array",
                    items: { type: "integer" },
                    example: [935, 937, 936],
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Requête invalide.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Invalid parameters" },
                },
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
                  message: { type: "string", example: "An error occurred." },
                },
              },
            },
          },
        },
      },
    },
  },

  "/tests/searchTest": {
    post: {
      tags: ["Tests"],
      summary: "Crée un test avec un filtre",
      description: "Crée un test en utilisant les critères de recherche spécifiés.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              keyword: { type: "string", example: "maths" },
              country: { type: "string", example: "US" },
              topic_id: { type: "integer", example: 1 },
              last_exam: { type: "boolean", example: true },
            },
          },
        },
      ],
      responses: {
        200: {
          description: "Test créé avec succès.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  test_id: { type: "integer", example: 123 },
                },
              },
            },
          },
        },
        400: {
          description: "Requête invalide.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Invalid parameters" },
                },
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
                  message: { type: "string", example: "An error occurred." },
                },
              },
            },
          },
        },
      },
    },
  },
};
