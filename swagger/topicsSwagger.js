module.exports = {
  "/topics": {
    get: {
      tags: ["Topics"],
      summary: "Récupérer tous les topics",
      description: "Retourne une liste de tous les topics",
      responses: {
        200: {
          description: "Liste des topics",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/Topic",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    post: {
      tags: ["Topics"],
      summary: "Créer un nouveau topic",
      description: "Ajoute un nouveau topic à la base de données",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                topic_name: { type: "string", example: "New Topic" },
                exam_number_question: { type: "integer", example: 10 },
                exam_duration: { type: "string", format: "time", example: "01:30:00" }
              },
              required: ["topic_name"]
            }
          }
        }
      },
      responses: {
        201: { description: "Topic créé avec succès" },
        500: { description: "Erreur interne du serveur" }
      }
    },
  },

  "/topics/{id}": {
    get: {
      tags: ["Topics"],
      summary: "Obtenir un topic par son ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: {
        200: { description: "Topic trouvé", schema: { $ref: "#/definitions/Topic" } },
        404: { description: "Topic non trouvé" },
        500: { description: "Erreur interne du serveur" }
      }
    },
    put: {
      tags: ["Topics"],
      summary: "Mettre à jour un topic",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              topic_name: {
                type: "string",
                example: "Updated Topic"
              },
              exam_number_question: {
                type: "integer",
                example: 20
              },
              exam_duration: {
                type: "string",
                format: "time",
                example: "02:00:00"
              }
            },
            required: ["topic_name", "exam_number_question", "exam_duration"]
          }
        }
      ],      
      responses: {
        200: { description: "Topic mis à jour avec succès" },
        404: { description: "Topic non trouvé" },
        500: { description: "Erreur interne du serveur" }
      }
    },
    delete: {
      tags: ["Topics"],
      summary: "Supprimer un topic",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: {
        200: { description: "Topic supprimé avec succès" },
        404: { description: "Topic non trouvé" },
        500: { description: "Erreur interne du serveur" }
      }
    }
  },

  "/topics/{topicId}/chapters": {
    get: {
      tags: ["Topics"],
      summary:
        "Récupérer tous les chapitres et sous-chapitres d'un topic avec filtres",
      description:
        "Retourne la liste des chapitres et leurs sous-chapitres pour un topic donné, avec possibilité de filtrer les questions via des paramètres de requête.",
      parameters: [
        {
          name: "topicId",
          in: "path",
          required: true,
          schema: {
            type: "integer",
             default: 1,
          },
          description: "ID du topic",
        },
        {
          name: "countries",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Pays pour filtrer les questions",
          example: "Spain",
        },
        {
          name: "question_not_seen",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description:
            "Inclure uniquement les questions non vues par l'utilisateur",
          example: true,
        },
        {
          name: "green_tag",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description: "Inclure les questions avec tag vert",
          example: true,
        },
        {
          name: "red_tag",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description: "Inclure les questions avec tag rouge",
          example: false,
        },
        {
          name: "orange_tag",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description: "Inclure les questions avec tag orange",
          example: false,
        },
        {
          name: "wrong_answer",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description:
            "Inclure uniquement les questions avec une réponse incorrecte",
          example: false,
        },
        {
          name: "last_exam",
          in: "query",
          required: false,
          schema: {
            type: "integer",
          },
          description: "Période de l'examen pour filtrer les questions",
          example: 200,
        },
      ],
      responses: {
        200: {
          description: "Liste des chapitres et sous-chapitres",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  topic: {
                    type: "string",
                    example: "010 - Air Law",
                  },
                  chapters: {
                    type: "array",
                    items: {
                      $ref: "##/definitions/ChapterWithSubChapters",
                    },
                  },
                },
              },
              examples: {
                "application/json": {
                  value: {
                    topic: "010 - Air Law",
                    chapters: [
                      {
                        id: 1,
                        chapter_text:
                          "010-01 - International Law: Conventions, Agreements and Organisations",
                        topic_id: 1,
                        created_at: "2024-12-25T02:50:30.000Z",
                        updated_at: "2024-12-25T02:50:30.000Z",
                        deleted_at: null,
                        chapterQuestionCount: 42,
                        subChapters: [
                          {
                            id: 1,
                            sub_chapter_text:
                              "010-01-01 - The Convention on International Civil Aviation (Chicago)",
                            chapter_id: 1,
                            created_at: "2024-12-25T02:50:30.000Z",
                            updated_at: "2024-12-25T02:50:30.000Z",
                            deleted_at: null,
                            questionCount: 17,
                          },
                          {
                            id: 2,
                            sub_chapter_text:
                              "010-01-02 - Other conventions and agreements",
                            chapter_id: 1,
                            created_at: "2024-12-25T02:50:30.000Z",
                            updated_at: "2024-12-25T02:50:30.000Z",
                            deleted_at: null,
                            questionCount: 25,
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Topic non trouvé",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },

  definitions: {
    Topic: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 1,
        },
        topic_name: {
          type: "string",
          example: "Air Law",
        },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
        },
        deleted_at: {
          type: "string",
          format: "date-time",
          example: null,
        },
      },
    },
    ChapterWithSubChapters: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 101,
        },
        chapter_text: {
          type: "string",
          example: "Introduction to Air Law",
        },
        topic_id: {
          type: "integer",
          example: 1,
        },
        subChapters: {
          type: "array",
          items: {
            $ref: "#/definitions/SubChapter",
          },
        },
      },
    },
    Chapter: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 101,
        },
        chapter_text: {
          type: "string",
          example: "Introduction to Air Law",
        },
        topic_id: {
          type: "integer",
          example: 1,
        },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
        },
        deleted_at: {
          type: "string",
          format: "date-time",
          example: null,
        },
      },
    },
    SubChapter: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 201,
        },
        sub_chapter_text: {
          type: "string",
          example: "Definitions and Terminology",
        },
        chapter_id: {
          type: "integer",
          example: 101,
        },
        questionCount: {
          type: "integer",
          example: 10,
          description: "Nombre de questions associées à ce sous-chapitre",
        },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
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