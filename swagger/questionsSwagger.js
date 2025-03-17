module.exports = {
 /* "/questions/validate-answer": {
    post: {
      summary: "Vérifier la réponse de l'utilisateur",
      description:
        "Vérifie si la réponse donnée par l'utilisateur est correcte pour une question donnée.",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              question_id: {
                type: "integer",
                example: 91,
                description: "ID de la question",
              },
              testId: {
                type: "integer",
                example: null,
                description: "ID du test",
              },
              exam_id: {
                type: "integer",
                example: null,
                description: "ID de l'exam",
              },
              userId: {
                type: "string",
                example: "user_2qlsoyDcuM1mk3dfCaRB6fCjaYe",
                description: "Réponse de l'utilisateur",
              },
              user_answer: {
                type: "string",
                example: "A",
                description: "Réponse de l'utilisateur",
              },
            },
            required: ["question_id", "user_answer", "userId"],
          },
        },
      ],
      responses: {
        200: {
          description: "Réponse validée avec succès",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Answer validated successfully.",
              },
              is_correct: {
                type: "boolean",
                example: true,
              },
              correct_answer: {
                type: "string",
                example: "A",
                description: "La bonne réponse à la question",
              },
            },
          },
        },
        400: {
          description: "Champs manquants dans la requête",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example:
                  "Missing required fields. Please provide question_id, user_answer, and user_id.",
              },
            },
          },
        },
        404: {
          description: "Question ou utilisateur non trouvé",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Question with id 123 does not exist.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred while validating the answer.",
              },
              error: {
                type: "string",
                example: "Error details here",
              },
            },
          },
        },
      },
    },
  },*/

  "/questions/pin": {
    post: {
      tags: ["Questions"],
      summary: "Marquer une question comme épinglée",
      description:
        "Marque une question comme épinglée pour un utilisateur spécifique.",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                example: "user_2qlsoyDcuM1mk3dfCaRB6fCjaYe",
                description: "ID de l'utilisateur",
              },
              testId: {
                type: "integer",
                example: 123,
                description: "ID du test",
              },
              question_id: {
                type: "integer",
                example: 1,
                description: "ID de la question",
              },
              is_pinned: {
                type: "json",
                example: "red",
              },
            },
            required: ["userId", "question_id", "testId"],
          },
        },
      ],
      responses: {
        200: {
          description: "Question épinglée avec succès.",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Question pinned successfully.",
              },
            },
          },
        },
        400: {
          description: "Champs manquants dans la requête",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example:
                  "Missing required fields. Please provide user_id and question_id.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Failed to execute query.",
              },
              error: {
                type: "string",
                example: "Error details here",
              },
            },
          },
        },
      },
    },
  },
  "/questions/{question_id}/{test_id}/{exam_id}": {
    get: {
      tags: ["Questions"],
      summary: "Récupérer une question par ID et ID de test",
      description:
        "Récupère les détails d'une question, y compris la réponse de l'utilisateur, les commentaires et les réactions.",
      parameters: [
        {
          name: "question_id",
          in: "path",
          required: true,
          description: "ID de la question à récupérer",
          schema: {
            type: "integer",
            example: 91,
          },
        },
        {
          name: "test_id",
          in: "path",
          description: "ID du test associé à la question",
          schema: {
            type: "integer",
            example: 0,
          },
        },
        {
          name: "exam_id",
          in: "path",
          description: "ID de l'exam associé à la question",
          schema: {
            type: "integer",
            example: 0,
          },
        },
      ],
      responses: {
        200: {
          description: "Détails de la question récupérés avec succès",
          schema: {
            type: "object",
            properties: {
              question_text: {
                type: "string",
                example: "What is the capital of France?",
              },
              answer: {
                type: "string",
                example: "A",
              },
              options: {
                type: "object",
                example: { A: "Paris", B: "London", C: "Berlin" },
              },
              explanation: {
                type: "string",
                example: "Paris is the capital of France.",
              },
              countries: {
                type: "object",
                example: { country: "France" },
              },
              user_answer: {
                type: "string",
                example: "A",
              },
              is_correct: {
                type: "boolean",
                example: true,
              },
              comments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      example: 1,
                    },
                    content: {
                      type: "string",
                      example: "Great question!",
                    },
                    created_at: {
                      type: "string",
                      format: "date-time",
                      example: "2023-01-01T12:00:00Z",
                    },
                    user: {
                      type: "object",
                      properties: {
                        username: {
                          type: "string",
                          example: "user123",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Utilisateur non authentifié",
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
        404: {
          description: "Question non trouvée",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Question not found.",
              },
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "An error occurred while retrieving the question.",
              },
              error: {
                type: "string",
                example: "Error details here",
              },
            },
          },
        },
      },
    },
  },

  "/questions/ameliorate": {
    post: {
      tags: ["Questions"],
      summary: "Améliorer une question",
      description:
        "Améliore l'explication d'une question donnée en fournissant une version enrichie et détaillée basée sur un contexte aviation spécifique.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              question_id: {
                type: "integer",
                example: 123,
                description: "ID de la question à améliorer",
              },
            },
            required: ["question_id"],
          },
        },
      ],
      responses: {
        200: {
          description: "Explication améliorée avec succès.",
          schema: {
            type: "object",
            properties: {
              id: {
                type: "integer",
                example: 456,
                description:
                  "ID de l'amélioration créée dans la base de données",
              },
              new_explanation: {
                type: "string",
                example:
                  "Cette explication améliorée inclut des détails techniques, des exemples concrets, et des clarifications...",
                description: "Nouvelle explication enrichie générée par l'IA",
              },
              date: {
                type: "string",
                format: "date-time",
                example: "2025-01-16T10:00:00Z",
                description: "Date de la création de l'amélioration",
              },
            },
          },
        },
        400: {
          description: "Requête invalide. Paramètres manquants ou incorrects.",
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "Question ID is required",
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
        404: {
          description: "Question introuvable.",
          schema: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "Question not found",
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
                example: "An error occurred while improving the explanation",
              },
              details: {
                type: "string",
                example: "Details about the error.",
              },
            },
          },
        },
      },
    },
  },

  "/questions/details": {
    post: {
      tags: ["Questions"],
      summary: "Créer un Topic, un Chapter, un SubChapter, et plusieurs Questions",
      description: "Cette route permet de créer un Topic avec un Chapter, un SubChapter, et plusieurs Questions en une seule requête.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              topic_name: { type: "string", example: "Législation aérienne" },
              exam_number_question: { type: "integer", example: 20 },
              exam_duration: { type: "integer", example: 60 },
              chapter_text: { type: "string", example: "Introduction au droit aérien" },
              sub_chapter_text: { type: "string", example: "Les bases du droit aérien" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question_text: { type: "string", example: "Quel est le principe de la législation aérienne?" },
                    answer: { type: "string", example: "A" },
                    options: { 
                      type: "object", 
                      example: { A: "Paris", B: "London", C: "Berlin", D: "Rome" }
                    },
                    explanation: { type: "string", example: "La législation aérienne est importante pour..." },
                    countries: { type: "array", items: { type: "string" }, example: ["France", "Canada"] },
                    explanation_images: { type: "array", items: { type: "string" }, example: ["image1.jpg", "image2.jpg"] },
                    question_images: { type: "array", items: { type: "string" }, example: ["question_image1.jpg"] },
                    quality_score: { type: "string", example: "A" },
                  },
                  required: ["question_text", "answer", "options"]
                }
              }
            },
            required: ["topic_name", "exam_number_question", "exam_duration", "chapter_text", "sub_chapter_text", "questions"]
          },
        },
      ],
      responses: {
        201: {
          description: "Création réussie du Topic, Chapter, SubChapter et des Questions",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Topic, Chapter, SubChapter et Questions créés avec succès." },
                  data: {
                    type: "object",
                    properties: {
                      topic: { $ref: "#/definitions/Topic" },
                      chapter: { $ref: "#/definitions/Chapter" },
                      subChapter: { $ref: "#/definitions/SubChapter" },
                      questions: {
                        type: "array",
                        items: { $ref: "#/definitions/Question" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Bad Request - Les données envoyées sont incorrectes ou manquantes.",
        },
        500: {
          description: "Erreur interne du serveur",
        }
      }
    }
  },

    "/questions/chatExplanation/{chat_explanation_id}": {
      delete: {
        tags: ["Questions"],
        summary: "Supprimer une explication de chat",
        description:
          "Supprime une explication de chat spécifique en fonction de l'ID fourni.",
        parameters: [
          {
            name: "chat_explanation_id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              example: 123,
            },
            description: "L'ID de l'explication de chat à supprimer",
          },
        ],
        responses: {
          200: {
            description: "Explication supprimée avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Chat explanation deleted successfully",
                    },
                    deletedId: {
                      type: "integer",
                      example: 123,
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Requête invalide (par exemple, si l'ID est manquant)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Chat explanation ID is required",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Explication introuvable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Chat explanation not found",
                    },
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
                    error: {
                      type: "string",
                      example: "An error occurred while deleting the chat explanation",
                    },
                    details: {
                      type: "string",
                      example: "Error details here",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

  "/questions": {
    get: {
      tags: ["Questions"],
      summary: "Récupérer toutes les questions",
      description: "Retourne une liste de toutes les questions",
      responses: {
        200: {
          description: "Liste des questions",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/Question",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    post: {
      tags: ["Questions"],
      summary: "Créer une nouvelle question",
      description: "Ajoute une nouvelle question à la base de données",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              question_text: { type: "string", example: "What is the capital of France?" },
              answer: { type: "string", example: "A" },
              options: { type: "object", example: { A: "Paris", B: "London", C: "Berlin", D: "Rome" } },
              explanation: { type: "string", example: "Paris is the capital of France" },
              countries: { type: "array", items: { type: "string" }, example: ["France"] },
              explanation_images: { type: "array", items: { type: "string" }, example: ["image1.jpg"] },
              question_images: { type: "array", items: { type: "string" }, example: ["question_image1.jpg"] },
              quality_score: { type: "string", example: "High" },
              sub_chapter_id: { type: "integer", example: 1 },
            },
            required: ["question_text", "answer", "options", "sub_chapter_id"],
          },
        },
      ],
      responses: {
        201: { description: "Question créée avec succès" },
        500: { description: "Erreur interne du serveur" },
      },
    },
  },


  "/questions/{id}": {
    get: {
      tags: ["Questions"],
      summary: "Obtenir une question par son ID",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      responses: {
        200: {
          description: "Question trouvée",
          schema: { $ref: "#/definitions/Question" },
        },
        404: { description: "Question non trouvée" },
        500: { description: "Erreur interne du serveur" },
      },
    },
    put: {
      tags: ["Questions"],
      summary: "Mettre à jour une question",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              question_text: { type: "string", example: "Updated question text" },
              answer: { type: "string", example: "B" },
              options: { type: "object", example: { A: "Paris", B: "London", C: "Berlin", D: "Rome" } },
              explanation: { type: "string", example: "Updated explanation" },
              countries: { type: "array", items: { type: "string" }, example: ["UK"] },
              explanation_images: { type: "array", items: { type: "string" }, example: ["updated_image.jpg"] },
              question_images: { type: "array", items: { type: "string" }, example: ["updated_question_image.jpg"] },
              quality_score: { type: "string", example: "Medium" },
              sub_chapter_id: { type: "integer", example: 2 },
            },
            required: ["question_text", "answer", "options", "sub_chapter_id"],
          },
        },
      ],
      responses: {
        200: { description: "Question mise à jour avec succès" },
        404: { description: "Question non trouvée" },
        500: { description: "Erreur interne du serveur" },
      },
    },
    delete: {
      tags: ["Questions"],
      summary: "Supprimer une question",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      responses: {
        200: { description: "Question supprimée avec succès" },
        404: { description: "Question non trouvée" },
        500: { description: "Erreur interne du serveur" },
      },
    },
  },

  "/questions/sub_chapters/{sub_chapter_id}": {
    get: {
      tags: ["Questions"],
      summary: "Récupérer les questions par sous-chapitre",
      description: "Retourne toutes les questions associées à un sous-chapitre donné.",
      parameters: [
        {
          in: "path",
          name: "sub_chapter_id",
          required: true,
          schema: { type: "integer" },
          description: "ID du sous-chapitre",
          example: 1,
        },
      ],
      responses: {
        200: {
          description: "Liste des questions récupérées avec succès",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/definitions/Question" } },
            },
          },
        },
        400: {
          description: "ID du sous-chapitre requis",
        },
        500: {
          description: "Erreur serveur",
        },
      },
    },
  },

  "/questions/chapters/{chapter_id}": {
    get: {
      tags: ["Questions"],
      summary: "Récupérer les questions par chapitre",
      description: "Retourne toutes les questions associées à un chapitre donné.",
      parameters: [
        {
          in: "path",
          name: "chapter_id",
          required: true,
          schema: { type: "integer" },
          description: "ID du chapitre",
          example: 1,
        },
      ],
      responses: {
        200: {
          description: "Liste des questions récupérées avec succès",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/definitions/Question" } },
            },
          },
        },
      },
    },
  },

  "/questions/topics/{topic_id}": {
    get: {
      tags: ["Questions"],
      summary: "Récupérer les questions par topic",
      description: "Retourne toutes les questions associées à un topic donné.",
      parameters: [
        {
          in: "path",
          name: "topic_id",
          required: true,
          schema: { type: "integer" },
          description: "ID du topic",
          example: 1,
        },
      ],
      responses: {
        200: {
          description: "Liste des questions récupérées avec succès",
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/definitions/Question" } },
            },
          },
        },
      },
    },
  },

  definitions: {
    Question: {
      type: "object",
      properties: {
        id: { type: "integer", example: 1 },
        question_text: { type: "string", example: "Quelle est la capitale de la France ?" },
        answer: { type: "string", example: "B" },
        options: {
          type: "object",
          example: { A: "Berlin", B: "Paris", C: "Londres", D: "Madrid" },
        },
        explanation: { type: "string", example: "Paris est la capitale de la France." },
        countries: { type: "array", items: { type: "string" }, example: ["France"] },
        explanation_images: { type: "array", items: { type: "string" }, example: [] },
        question_images: { type: "array", items: { type: "string" }, example: [] },
        quality_score: { type: "string", example: "High" },
        sub_chapter_id: { type: "integer", example: 3 },
        created_at: { type: "string", format: "date-time", example: "2025-02-13T10:00:00Z" },
        updated_at: { type: "string", format: "date-time", example: "2025-02-13T10:00:00Z" },
      },
    },
  },

  definitions: {
    QuestionAnswerResponse: {
      type: "object",
      properties: {
        question_id: {
          type: "integer",
          example: 1,
        },
        user_answer: {
          type: "string",
          example: "A",
        },
        userId: {
          type: "integer",
          example: 123,
        },
        testId: {
          type: "integer",
          example: 123,
        },
        is_correct: {
          type: "boolean",
          example: true,
        },
        correct_answer: {
          type: "string",
          example: "A",
        },
      },
    },
    Question: {
      type: "object",
      properties: {
        id: { type: "integer", example: 1 },
        question_text: { type: "string", example: "What is the capital of France?" },
        answer: { type: "string", example: "A" },
        options: { type: "object", example: { A: "Paris", B: "London", C: "Berlin", D: "Rome" } },
        explanation: { type: "string", example: "Paris is the capital of France" },
        countries: { type: "array", items: { type: "string" }, example: ["France"] },
        explanation_images: { type: "array", items: { type: "string" }, example: ["image1.jpg"] },
        question_images: { type: "array", items: { type: "string" }, example: ["question_image1.jpg"] },
        quality_score: { type: "string", example: "High" },
        sub_chapter_id: { type: "integer", example: 1 },
        created_at: { type: "string", format: "date-time", example: "2024-12-01T12:00:00Z" },
        updated_at: { type: "string", format: "date-time", example: "2024-12-01T12:00:00Z" },
      },
    },
  },
};
