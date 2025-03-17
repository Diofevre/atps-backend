module.exports = {
    "/avis": {
      get: {
        tags: ["Avis"],
        summary: "Récupérer tous les avis",
        description: "Retourne une liste de tous les avis avec option de recherche.",
        parameters: [
          {
            in: "query",
            name: "search",
            required: false,
            type: "string",
            description: "Terme de recherche pour filtrer les avis (nom, prénom, email, sujet ou message).",
            example: "Jean",
          },
        ],
        responses: {
          200: {
            description: "Liste des avis",
            schema: {
              type: "array",
              items: {
                $ref: "#/definitions/Avis",
              },
            },
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
      post: {
        tags: ["Avis"],
        summary: "Créer un nouvel avis",
        description: "Ajoute un nouvel avis dans la base de données.",
        parameters: [
          {
            in: "body",
            name: "body",
            required: true,
            description: "Données de l'avis à ajouter",
            schema: {
              $ref: "#/definitions/Avis",
            },
          },
        ],
        responses: {
          201: {
            description: "Avis créé avec succès",
            schema: {
              $ref: "#/definitions/Avis",
            },
          },
          400: {
            description: "Requête invalide",
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
    },
  
    "/avis/{id}": {
      get: {
        tags: ["Avis"],
        summary: "Récupérer un avis par ID",
        description: "Retourne un avis spécifique en fonction de son ID.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            type: "integer",
            description: "ID de l'avis à récupérer",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Avis trouvé",
            schema: {
              $ref: "#/definitions/Avis",
            },
          },
          404: {
            description: "Avis non trouvé",
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
      put: {
        tags: ["Avis"],
        summary: "Mettre à jour un avis",
        description: "Met à jour les informations d'un avis existant.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            type: "integer",
            description: "ID de l'avis à mettre à jour",
            example: 1,
          },
          {
            in: "body",
            name: "body",
            required: true,
            description: "Données à mettre à jour",
            schema: {
              $ref: "#/definitions/Avis",
            },
          },
        ],
        responses: {
          200: {
            description: "Avis mis à jour avec succès",
            schema: {
              $ref: "#/definitions/Avis",
            },
          },
          404: {
            description: "Avis non trouvé",
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
      delete: {
        tags: ["Avis"],
        summary: "Supprimer un avis",
        description: "Supprime un avis en fonction de son ID.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            type: "integer",
            description: "ID de l'avis à supprimer",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Avis supprimé avec succès",
          },
          404: {
            description: "Avis non trouvé",
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
    },
  
    definitions: {
      Avis: {
        type: "object",
        properties: {
          
          nom: {
            type: "string",
            example: "Jean",
          },
          prenom: {
            type: "string",
            example: "Dupont",
          },
          email: {
            type: "string",
            format: "email",
            example: "jean.dupont@example.com",
          },
          phone: {
            type: "string",
            example: "+33612345678",
          },
          subject: {
            type: "string",
            example: "Problème avec le service client",
          },
          message: {
            type: "string",
            example: "J'ai eu un problème avec ma commande et j'aimerais en discuter.",
          }
        },
      },
    },
  };
  