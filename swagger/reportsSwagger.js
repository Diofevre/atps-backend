module.exports = {
  "/reports": {
    get: {
      tags: ["Reports"],
      summary: "Récupérer tous les rapports",
      description:
        "Cette route permet de récupérer la liste de tous les rapports enregistrés.",
      responses: {
        200: {
          description: "Liste de tous les rapports récupérée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/definitions/Report" },
              },
              example: [
                {
                  id: "report_12345",
                  user_id: "user_67890",
                  categorie: "Informatique",
                  contenu: "Contenu du rapport",
                  created_at: "2025-01-06T12:00:00Z",
                  updated_at: "2025-01-06T12:00:00Z",
                },
                {
                  id: "report_67890",
                  user_id: "user_12345",
                  categorie: "Sécurité",
                  contenu: "Problème de sécurité détecté",
                  created_at: "2025-02-10T14:30:00Z",
                  updated_at: "2025-02-10T14:30:00Z",
                },
              ],
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
    post: {
      tags: ["Reports"],
      summary: "Créer un nouveau rapport",
      description: "Crée un nouveau rapport avec une catégorie et un contenu.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              user_id: {
                type: "string",
                example: "user_2qmmaUfRB626gHnglkTsUcaDMji",
              },
              categorie: {
                type: "string",
                example: "Informatique",
              },
              contenu: {
                type: "string",
                example: "Contenu du rapport",
              },
            },
            required: ["categorie", "contenu"],
          },
        },
      ],
      responses: {
        200: {
          description: "Rapport créé avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Rapport créé avec succès",
                  },
                  report: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "report_12345",
                        description: "L'ID unique du rapport créé.",
                      },
                      user_id: {
                        type: "string",
                        example: "user_67890",
                        description:
                          "L'ID de l'utilisateur ayant créé le rapport.",
                      },
                      categorie: {
                        type: "string",
                        example: "Informatique",
                        description: "La catégorie du rapport.",
                      },
                      contenu: {
                        type: "string",
                        example: "Contenu du rapport",
                        description: "Le contenu détaillé du rapport.",
                      },
                      created_at: {
                        type: "string",
                        format: "date-time",
                        example: "2025-01-06T12:00:00Z",
                        description:
                          "La date et l'heure de création du rapport.",
                      },
                      updated_at: {
                        type: "string",
                        format: "date-time",
                        example: "2025-01-06T12:00:00Z",
                        description:
                          "La date et l'heure de la dernière mise à jour du rapport.",
                      },
                    },
                  },
                },
              },
              example: {
                message: "Rapport créé avec succès",
                report: {
                  id: "report_12345",
                  user_id: "user_67890",
                  categorie: "Informatique",
                  contenu: "Contenu du rapport",
                  created_at: "2025-01-06T12:00:00Z",
                  updated_at: "2025-01-06T12:00:00Z",
                },
              },
            },
          },
        },
        400: {
          description: "Paramètres invalides ou manquants",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Categorie et contenu sont obligatoires.",
                  },
                },
              },
              example: {
                message: "Categorie et contenu sont obligatoires.",
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

  "/reports/{reportId}/seen": {
    put: {
      tags: ["Reports"],
      summary: "Marquer un rapport comme vu",
      description:
        "Cette route permet de marquer un rapport spécifique comme vu en mettant à jour le champ `seen` à `true`.",
      parameters: [
        {
          in: "path",
          name: "reportId",
          required: true,
          description: "L'ID unique du rapport à mettre à jour",
          schema: {
            type: "string",
            example: "1",
          },
        },
      ],
      responses: {
        200: {
          description: "Le rapport a été marqué comme vu avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Le rapport a été marqué comme vu.",
                  },
                },
              },
              example: {
                message: "Le rapport a été marqué comme vu.",
              },
            },
          },
        },
        404: {
          description: "Rapport non trouvé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Rapport non trouvé.",
                  },
                },
              },
              example: {
                message: "Rapport non trouvé.",
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
    Report: {
      type: "object",
      properties: {
        id: {
          type: "string",
          example: "report_12345",
        },
        user_id: {
          type: "string",
          example: "user_67890",
        },
        categorie: {
          type: "string",
          example: "Informatique",
        },
        contenu: {
          type: "string",
          example: "Contenu du rapport",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2025-01-06T12:00:00Z",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          example: "2025-01-06T12:00:00Z",
        },
      },
    },
  },
};
