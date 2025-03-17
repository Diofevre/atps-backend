module.exports = {
  "/users": {
    get: {
      tags: ["Users"],
      summary: "Récupérer tous les utilisateurs",
      description: "Retourne une liste de tous les utilisateurs dans la base de données",
      responses: {
        200: {
          description: "Liste des utilisateurs",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/User",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },
  "/users/me": {
    get: {
      tags: ["Users"],
      summary: "Récupérer les informations de l'utilisateur authentifié",
      description: "Retourne les informations de l'utilisateur connecté grâce à son ID.",
      responses: {
        200: {
          description: "Informations de l'utilisateur",
          schema: {
            $ref: "#/definitions/User",
          },
        },
        404: {
          description: "Utilisateur introuvable",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Mettre à jour les informations de l'utilisateur authentifié",
      description: "Permet à l'utilisateur connecté de mettre à jour ses informations personnelles.",
      parameters: [
        {
          name: "body",
          in: "body",
          description: "Données à mettre à jour pour l'utilisateur",
          schema: {
            type: "object",
            properties: {
              name: { type: "string", example: "John Doe" },
              username: { type: "string", example: "johndoe" },
              email: { type: "string", format: "email", example: "john.doe@example.com" },
              picture: { type: "string", example: "https://example.com/picture.jpg" },
              country: { type: "string", exemple: "Spain"},
              language: { type: "string", exemple: "Spanish"}
            },
          },
        },
      ],
      responses: {
        200: {
          description: "Les informations de l'utilisateur ont été mises à jour avec succès",
          schema: {
            $ref: "#/definitions/User",
          },
        },
        404: {
          description: "Utilisateur introuvable",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Supprimer le compte de l'utilisateur authentifié",
      description: "Permet à l'utilisateur connecté de supprimer son propre compte.",
      responses: {
        200: {
          description: "Le compte utilisateur a été supprimé avec succès",
        },
        404: {
          description: "Utilisateur introuvable",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },
  definitions: {
    User: {
      type: "object",
      properties: {
        id: {
          type: "string",
          example: "12345",
        },
        clerkId: {
          type: "string",
          example: "clerk_12345",
        },
        email: {
          type: "string",
          format: "email",
          example: "john.doe@example.com",
        },
        name: {
          type: "string",
          example: "John Doe",
        },
        username: {
          type: "string",
          example: "johndoe",
        },
        picture: {
          type: "string",
          example: "https://example.com/picture.jpg",
        },
        country: {
          type: "string",
          example: "Spain",
        },
        language: {
          type: "string",
          example: "Spanish",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          example: "2024-12-01T12:00:00Z",
        },
      },
    },
  },
  "/users/suspend": {
    post: {
      tags: ["Users"],
      summary: "Suspendre ou réactiver un utilisateur",
      description: "Permet de suspendre un utilisateur (ce qui met en pause son abonnement) ou de le réactiver.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          description: "Informations pour suspendre ou réactiver un utilisateur",
          schema: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                example: "clerk_12345",
                description: "Identifiant Clerk de l'utilisateur à suspendre ou réactiver"
              },
              action: {
                type: "string",
                enum: ["suspend", "unsuspend"],
                example: "suspend",
                description: "Action à effectuer: 'suspend' pour suspendre, 'unsuspend' pour réactiver"
              }
            },
            required: ["userId", "action"]
          }
        }
      ],
      responses: {
        200: {
          description: "Action effectuée avec succès",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "User suspended and subscription paused" }
            }
          }
        },
        400: {
          description: "Action invalide",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "Invalid action" }
            }
          }
        },
        404: {
          description: "Utilisateur introuvable",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "User not found" }
            }
          }
        },
        500: {
          description: "Erreur interne du serveur",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "Internal server error" }
            }
          }
        }
      }
    }
  }
};
