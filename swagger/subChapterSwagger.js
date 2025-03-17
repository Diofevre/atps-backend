module.exports = {
  "/subchapters": {
    get: {
      tags: ["SubChapters"],
      summary: "Récupérer tous les sous-chapitres",
      description: "Retourne une liste de tous les sous-chapitres",
      responses: {
        200: {
          description: "Liste des sous-chapitres",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/SubChapter",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    post: {
      tags: ["SubChapters"],
      summary: "Créer un nouveau sous-chapitre",
      description: "Ajoute un nouveau sous-chapitre à la base de données",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              sub_chapter_text: {
                type: "string",
                example: "Introduction to Air Law",
              },
              chapter_id: { type: "integer", example: 1 },
            },
            required: ["sub_chapter_text", "chapter_id"],
          },
        },
      ],
      responses: {
        201: { description: "Sous-chapitre créé avec succès" },
        500: { description: "Erreur interne du serveur" },
      },
    },
  },

  "/subchapters/{id}": {
    get: {
      tags: ["SubChapters"],
      summary: "Obtenir un sous-chapitre par son ID",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      responses: {
        200: {
          description: "Sous-chapitre trouvé",
          schema: { $ref: "#/definitions/SubChapter" },
        },
        404: { description: "Sous-chapitre non trouvé" },
        500: { description: "Erreur interne du serveur" },
      },
    },
    put: {
      tags: ["SubChapters"],
      summary: "Mettre à jour un sous-chapitre",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              sub_chapter_text: {
                type: "string",
                example: "Updated SubChapter Text",
              },
              chapter_id: { type: "integer", example: 2 },
            },
            required: ["sub_chapter_text", "chapter_id"],
          },
        },
      ],
      responses: {
        200: { description: "Sous-chapitre mis à jour avec succès" },
        404: { description: "Sous-chapitre non trouvé" },
        500: { description: "Erreur interne du serveur" },
      },
    },
    delete: {
      tags: ["SubChapters"],
      summary: "Supprimer un sous-chapitre",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      responses: {
        200: { description: "Sous-chapitre supprimé avec succès" },
        404: { description: "Sous-chapitre non trouvé" },
        500: { description: "Erreur interne du serveur" },
      },
    },
  },

  "/subchapters/chapters/{chapter_id}": {
    get: {
      tags: ["SubChapters"],
      summary: "Récupérer tous les sous-chapitres d'un chapitre",
      description:
        "Cette route permet de récupérer tous les sous-chapitres associés à un chapitre donné.",
      parameters: [
        {
          in: "path",
          name: "chapter_id",
          required: true,
          schema: {
            type: "integer",
          },
          description:
            "ID du chapitre pour lequel récupérer les sous-chapitres.",
          example: 1,
        },
      ],
      responses: {
        200: {
          description: "Liste des sous-chapitres récupérés avec succès",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/definitions/SubChapter" },
              },
              example: [
                {
                  id: 1,
                  sub_chapter_text: "Introduction à la mécanique",
                  chapter_id: 1,
                  created_at: "2025-02-13T10:00:00Z",
                  updated_at: "2025-02-13T10:00:00Z",
                },
                {
                  id: 2,
                  sub_chapter_text: "Les lois de Newton",
                  chapter_id: 1,
                  created_at: "2025-02-13T10:00:00Z",
                  updated_at: "2025-02-13T10:00:00Z",
                },
              ],
            },
          },
        },
        400: {
          description: "Paramètre manquant ou invalide",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "L'ID du chapitre est requis.",
                  },
                },
              },
              example: {
                message: "L'ID du chapitre est requis.",
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
    SubChapter: {
      type: "object",
      properties: {
        id: { type: "integer", example: 1 },
        sub_chapter_text: {
          type: "string",
          example: "Introduction to Air Law",
        },
        chapter_id: { type: "integer", example: 1 },
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
        deleted_at: { type: "string", format: "date-time", example: null },
      },
    },
  },
};
