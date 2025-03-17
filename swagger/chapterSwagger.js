module.exports = {
    "/chapters": {
      get: {
        tags: ["Chapters"],
        summary: "Récupérer tous les chapitres",
        description: "Retourne une liste de tous les chapitres",
        responses: {
          200: {
            description: "Liste des chapitres",
            schema: {
              type: "array",
              items: {
                $ref: "#/definitions/Chapter",
              },
            },
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
      post: {
        tags: ["Chapters"],
        summary: "Créer un nouveau chapitre",
        description: "Ajoute un nouveau chapitre à la base de données",
        parameters: [
            {
              in: "body",
              name: "body",
              required: true,
              schema: {
                type: "object",
                properties: {
                  chapter_text: { type: "string", example: "Introduction to Air Law" },
                  topic_id: { type: "integer", example: 1 },
                },
                required: ["chapter_text", "topic_id"],
              },
            },
          ],
        responses: {
          201: { description: "Chapitre créé avec succès" },
          500: { description: "Erreur interne du serveur" },
        },
      },
    },
  
    "/chapters/{id}": {
      get: {
        tags: ["Chapters"],
        summary: "Obtenir un chapitre par son ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Chapitre trouvé", schema: { $ref: "#/definitions/Chapter" } },
          404: { description: "Chapitre non trouvé" },
          500: { description: "Erreur interne du serveur" },
        },
      },
      put: {
        tags: ["Chapters"],
        summary: "Mettre à jour un chapitre",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          {
            in: "body",
            name: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                chapter_text: { type: "string", example: "Updated Chapter Text" },
                topic_id: { type: "integer", example: 2 },
              },
              required: ["chapter_text", "topic_id"],
            },
          },
        ],
        responses: {
          200: { description: "Chapitre mis à jour avec succès" },
          404: { description: "Chapitre non trouvé" },
          500: { description: "Erreur interne du serveur" },
        },
      },
      delete: {
        tags: ["Chapters"],
        summary: "Supprimer un chapitre",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Chapitre supprimé avec succès" },
          404: { description: "Chapitre non trouvé" },
          500: { description: "Erreur interne du serveur" },
        },
      },
    },

    "/chapters/topics/{topic_id}": {
    get: {
      tags: ["Chapters"],
      summary: "Récupérer tous les chapitres d'un topic",
      description: "Cette route permet de récupérer tous les chapitres associés à un topic donné.",
      parameters: [
        {
          in: "path",
          name: "topic_id",
          required: true,
          schema: {
            type: "integer",
          },
          description: "ID du topic pour lequel récupérer les chapitres.",
          example: 1,
        },
      ],
      responses: {
        200: {
          description: "Liste des chapitres récupérés avec succès",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/definitions/Chapter" },
              },
              example: [
                {
                  id: 1,
                  chapter_text: "Introduction à la physique",
                  topic_id: 1,
                  created_at: "2025-02-13T10:00:00Z",
                  updated_at: "2025-02-13T10:00:00Z",
                },
                {
                  id: 2,
                  chapter_text: "Les lois de Newton",
                  topic_id: 1,
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
                    example: "L'ID du topic est requis.",
                  },
                },
              },
              example: {
                message: "L'ID du topic est requis.",
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
                  message: { type: "string", example: "Erreur interne du serveur" },
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
      Chapter: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          chapter_text: { type: "string", example: "Introduction to Air Law" },
          topic_id: { type: "integer", example: 1 },
          created_at: { type: "string", format: "date-time", example: "2024-12-01T12:00:00Z" },
          updated_at: { type: "string", format: "date-time", example: "2024-12-01T12:00:00Z" },
          deleted_at: { type: "string", format: "date-time", example: null },
        },
      },
    },
  };
  