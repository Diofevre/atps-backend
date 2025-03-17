module.exports = {
    "/chat_lessons": {
      post: {
        tags: ["ChatbotLessons"],
        summary: "Envoyer un message au chatbot",
        description:
          "Interagit avec le chatbot spécialisé dans l'aviation pour obtenir une réponse.",
        parameters: [
          {
            in: "body",
            name: "body",
            required: true,
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Hello",
                  description:
                    "Le message ou la question posée par l'utilisateur.",
                },
                page_id : {
                  type: "integer",
                  example: 1,
                  description:
                    "L'id de la courante question.",
                },
              },
              required: ["message"],
            },
          },
        ],
        responses: {
          200: {
            description: "Réponse réussie du chatbot",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    response: {
                      type: "string",
                      example:
                        "La vitesse de croisière d'un Boeing 747 est d'environ 900 km/h.",
                    },
                  },
                },
                example: {
                  response:
                    "La vitesse de croisière d'un Boeing 747 est d'environ 900 km/h.",
                },
              },
            },
          },
          500: {
            description: "Erreur de communication avec le chatbot",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Erreur de communication avec le chatbot",
                    },
                  },
                },
                example: {
                  error: "Erreur de communication avec le chatbot",
                },
              },
            },
          },
        },
      },
    },
    "/chat_lessons/logs": {
      get: {
        tags: ["ChatbotLessons"],
        summary: "Récupérer les logs des interactions avec le chatbot",
        description:
          "Récupère les logs des questions posées et des réponses fournies par le chatbot.",
        responses: {
          200: {
            description: "Logs récupérés avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                        description: "ID unique du log.",
                      },
                      question: {
                        type: "string",
                        example:
                          "Quelle est la capacité de carburant d'un Airbus A380 ?",
                      },
                      response: {
                        type: "string",
                        example:
                          "La capacité de carburant de l'Airbus A380 est d'environ 320 000 litres.",
                      },
                      responseTime: {
                        type: "integer",
                        example: 150,
                        description: "Temps de réponse en millisecondes.",
                      },
                      status: {
                        type: "string",
                        example: "success",
                        description:
                          "Statut de l'interaction (success ou error).",
                      },
                      createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2025-01-14T12:00:00Z",
                      },
                    },
                  },
                },
                example: [
                  {
                    id: 1,
                    question:
                      "Quelle est la capacité de carburant d'un Airbus A380 ?",
                    response:
                      "La capacité de carburant de l'Airbus A380 est d'environ 320 000 litres.",
                    responseTime: 150,
                    status: "success",
                    createdAt: "2025-01-14T12:00:00Z",
                  },
                ],
              },
            },
          },
          500: {
            description: "Erreur lors de la récupération des logs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Erreur lors de la récupération des logs",
                    },
                  },
                },
                example: {
                  error: "Erreur lors de la récupération des logs",
                },
              },
            },
          },
        },
      },
    },
    definitions: {
      Log: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          question: {
            type: "string",
            example: "Quelle est la capacité de carburant d'un Airbus A380 ?",
          },
          response: {
            type: "string",
            example:
              "La capacité de carburant de l'Airbus A380 est d'environ 320 000 litres.",
          },
          responseTime: {
            type: "integer",
            example: 150,
          },
          status: {
            type: "string",
            example: "success",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-01-14T12:00:00Z",
          },
        },
      },
    },
    "/chat_lessons/logs/{logId}": {
      put: {
        tags: ["ChatbotLessons"],
        summary:
          "Modifier un message utilisateur et mettre à jour la réponse de l'IA",
        description:
          "Permet à un utilisateur authentifié de modifier un message qu'il a envoyé, ainsi que de mettre à jour la réponse générée par l'IA et les explications associées.",
        parameters: [
          {
            name: "logId",
            in: "path",
            required: true,
            description: "ID unique du log à modifier.",
            schema: {
              type: "integer",
              example: 1,
            },
          },
          {
            name: "body",
            in: "body",
            required: true,
            description: "Nouveau message à remplacer dans le log.",
            schema: {
              type: "object",
              properties: {
                newMessage: {
                  type: "string",
                  example: "Updated user message",
                  description: "Le nouveau message de l'utilisateur.",
                },
                page_id : {
                  type: "integer",
                  example: 1,
                  description: "L'id de la question courante.",
                },
              },
              required: ["newMessage"],
            },
          },
        ],
        responses: {
          200: {
            description: "Message et réponse mis à jour avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Message and response updated successfully",
                    },
                    updatedLog: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1,
                          description: "ID unique du log.",
                        },
                        newMessage: {
                          type: "string",
                          example: "Updated user message",
                          description: "Le nouveau message de l'utilisateur.",
                        },
                        newResponse: {
                          type: "string",
                          example:
                            "Voici la nouvelle réponse basée sur votre message modifié.",
                          description: "La nouvelle réponse générée par l'IA.",
                        },
                        explanations: {
                          type: "array",
                          items: {
                            type: "string",
                          },
                          example: [
                            "Information pertinente 1",
                            "Information pertinente 2",
                          ],
                          description:
                            "Les explications pertinentes utilisées pour générer la nouvelle réponse.",
                        },
                      },
                    },
                  },
                },
                example: {
                  success: true,
                  message: "Message and response updated successfully",
                  updatedLog: {
                    id: 1,
                    newMessage: "Updated user message",
                    newResponse:
                      "Voici la nouvelle réponse basée sur votre message modifié.",
                    explanations: [
                      "Information pertinente 1",
                      "Information pertinente 2",
                    ],
                  },
                },
              },
            },
          },
          400: {
            description: "Requête invalide",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "New message cannot be empty",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Utilisateur non authentifié",
            content: {
              "application/json": {
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
            },
          },
          403: {
            description: "Non autorisé à modifier ce log",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Unauthorized to modify this log",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Error updating the message and response",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  
    "/chat_lessons/delete/{logId}": {
      delete: {
        tags: ["ChatbotLessons"],
        summary: "Supprimer un log d'interaction avec le chatbot",
        description:
          "Permet à un utilisateur authentifié de supprimer un log d'interaction spécifique, ainsi que toutes les données associées.",
        parameters: [
          {
            name: "logId",
            in: "path",
            required: true,
            description: "ID unique du log à supprimer.",
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        responses: {
          200: {
            description: "Log supprimé avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                      description: "Indique si la suppression a réussi.",
                    },
                    message: {
                      type: "string",
                      example: "Log deleted successfully",
                      description: "Message de confirmation de la suppression.",
                    },
                  },
                },
                example: {
                  success: true,
                  message: "Log deleted successfully",
                },
              },
            },
          },
          401: {
            description: "Utilisateur non authentifié",
            content: {
              "application/json": {
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
            },
          },
          403: {
            description: "Non autorisé à supprimer ce log",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Unauthorized to delete this log",
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Log introuvable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Log not found",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Error deleting the log",
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
  