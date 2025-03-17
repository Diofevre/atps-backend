module.exports = {
  "/exams/create": {
    post: {
      tags: ["Exams"],
      summary: "Créer un examen",
      description:
        "Crée un nouvel examen pour un sujet donné en fonction des filtres et sous-chapitres fournis.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              topicId: {
                type: "integer",
                example: 1,
              },
              filters: {
                type: "object",
                properties: {
                  countries: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                    example: null,
                  },
                  question_not_seen: {
                    type: "boolean",
                    example: false,
                  },
                  wrong_answer: {
                    type: "boolean",
                    example: false,
                  },
                  last_exam: {
                    type: "string",
                    format: "date-time",
                    example: null,
                  },
                },
              },
            },
            required: ["topicId", "filters"],
          },
        },
      ],
      responses: {
        201: {
          description: "Examen créé avec succès.",
          schema: {
            type: "object",
            properties: {
              test_id: {
                type: "integer",
                example: 12345,
              },
              topic_name: {
                type: "string",
                example: "Air Law",
              },
              total_question: {
                type: "integer",
                example: 10,
              },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    exam_user_id: {
                      type: "integer",
                      example: 1,
                    },
                    exam_id: {
                      type: "integer",
                      example: 12345,
                    },
                    question_id: {
                      type: "integer",
                      example: 67890,
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Paramètres manquants ou invalides.",
        },
        404: {
          description: "Topic introuvable.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },
  "/exams/save": {
    post: {
      tags: ["Exams"],
      summary: "Sauvegarder un examen",
      description:
        "Sauvegarde l'état actuel d'un examen en cours, met à jour la durée de l'examen et marque l'examen comme terminé.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              exam_id: {
                type: "integer",
                example: 123,
              },
              data: {
                type: "array",
                description: "Liste des réponses utilisateur",
                items: {
                  type: "object",
                  properties: {
                    question_id: {
                      type: "integer",
                      example: 10,
                      description: "ID de la question",
                    },
                    user_answer: {
                      type: "string",
                      example: "A",
                      description: "Réponse de l'utilisateur",
                    },
                  },
                  required: ["question_id", "user_answer"],
                },
              },
            },
            required: ["exam_id"],
          },
        },
      ],
      responses: {
        200: {
          description: "Examen sauvegardé avec succès.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Examen sauvegardé",
              },
            },
          },
        },
        400: {
          description: "Paramètres manquants ou invalides.",
        },
        401: {
          description: "Utilisateur non authentifié.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },
  "/exams/validate": {
    post: {
      tags: ["Exams"],
      summary: "Valider un examen",
      description:
        "Valide un exam, calcule les statistiques (correct, incorrect, non répondu) et marque l'exam comme terminé.",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              exam_id: {
                type: "integer",
                example: 135,
                description: "ID de l'examen à valider",
              },
              filter: {
                type: "string",
                example: null,
                description:
                  "Filtrer les résultats par 'correct', 'incorrect', 'no-answer' ou 'pinned'",
                default: null,
              },
              data: {
                type: "array",
                description: "Liste des réponses utilisateur",
                items: {
                  type: "object",
                  properties: {
                    question_id: {
                      type: "integer",
                      example: 10,
                      description: "ID de la question",
                    },
                    user_answer: {
                      type: "string",
                      example: "A",
                      description: "Réponse de l'utilisateur",
                    },
                  },
                  required: ["question_id", "user_answer"],
                },
              },
            },
            required: ["exam_id", "data"],
          },
        },
      ],
      responses: {
        200: {
          description: "Validation de l'examen réussie.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Validation completed successfully.",
              },
              exam_id: {
                type: "integer",
                example: 123,
              },
              timeSpent: {
                type: "string",
                example: "00:25:15",
              },
              exam_duration: {
                type: "string",
                example: "01:00:00",
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
                      example: "4",
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
                example: "Invalid or missing parameters.",
              },
            },
          },
        },
        404: {
          description: "Exam non trouvé.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Exam not found.",
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
                example: "An error occurred while saving the exam.",
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

  "/exams/list": {
    get: {
      tags: ["Exams"],
      summary: "Liste des tests non terminés pour un utilisateur",
      description:
        "Récupère tous les tests non terminés pour un utilisateur spécifique.",
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

  "/exams/reinit": {
    post: {
      tags: ["Exams"],
      summary: "Réinitialiser un examen",
      description:
        "Réinitialise un examen existant en créant un nouvel examen avec les mêmes questions et une durée recalculée.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              exam_id: {
                type: "integer",
                example: 123,
                description: "ID de l'examen à réinitialiser",
              },
            },
            required: ["exam_id"],
          },
        },
      ],
      responses: {
        200: {
          description: "Examen réinitialisé avec succès.",
          schema: {
            type: "object",
            properties: {
              exam_id: {
                type: "integer",
                example: 123,
              },
              topic_name: {
                type: "string",
                example: "Air Law",
              },
              total_question: {
                type: "integer",
                example: 10,
              },
              exam_duration: {
                type: "string",
                example: "01:30:00",
              },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question_id: {
                      type: "integer",
                      example: 101,
                    },
                    question_text: {
                      type: "string",
                      example: "What is 2 + 2?",
                    },
                    options: {
                      type: "object",
                      additionalProperties: {
                        type: "string",
                      },
                      example: {
                        A: "3",
                        B: "4",
                        C: "5",
                        D: "6",
                      },
                    },
                    correct_answer: {
                      type: "string",
                      example: "B",
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Paramètres manquants ou invalides.",
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "Invalid or missing parameters.",
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
                example: "User not authenticated.",
              },
            },
          },
        },
        404: {
          description: "Examen non trouvé.",
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "Exam not found.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur.",
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "An error occurred while reinitializing the exam.",
              },
            },
          },
        },
      },
    },
  },

  definitions: {
    Exam: {
      type: "object",
      properties: {
        test_id: {
          type: "integer",
          example: 12345,
        },
        total_question: {
          type: "integer",
          example: 10,
        },
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              exam_user_id: {
                type: "integer",
                example: 1,
              },
              exam_id: {
                type: "integer",
                example: 12345,
              },
              question_id: {
                type: "integer",
                example: 67890,
              },
            },
          },
        },
      },
    },
    Filter: {
      type: "object",
      properties: {
        countries: {
          type: "array",
          items: {
            type: "string",
          },
          example: [null],
        },
        question_not_seen: {
          type: "boolean",
          example: false,
        },
        wrong_answer: {
          type: "boolean",
          example: false,
        },
        last_exam: {
          type: "string",
          format: "date-time",
          example: null,
        },
      },
    },
  },
};
