module.exports = {
  "/dictionary": {
    get: {
      tags: ["Dictionary"],
      summary: "Lister tous les mots du dictionnaire",
      description: "Retourne une liste complète de tous les mots du dictionnaire avec leurs définitions.",
      responses: {
        200: {
          description: "Liste des mots du dictionnaire.",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/DictionaryEntry",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
    post: {
      tags: ["Dictionary"],
      summary: "Ajouter un nouveau mot",
      description: "Ajoute un mot avec sa définition dans le dictionnaire.",
      parameters: [
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              word: {
                type: "string",
                example: "Aerodynamics",
              },
              definition: {
                type: "string",
                example: "The study of the motion of air and how it interacts with solid objects.",
              },
              image_url:{
                type: "string",
                example: "https://exemple.com/image.jpg",
                description: "URL de l'image associée au mot (facultatif)",
              }
            },
            required: ["word", "definition"],
          },
        },
      ],
      responses: {
        201: {
          description: "Mot ajouté avec succès.",
          schema: {
            $ref: "#/definitions/DictionaryEntry",
          },
        },
        400: {
          description: "Données invalides ou incomplètes.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },

  "/dictionary/search": {
    get: {
      tags: ["Dictionary"],
      summary: "Rechercher un mot dans le dictionnaire",
      description: "Recherche un mot spécifique et retourne sa définition.",
      parameters: [
        {
          in: "query",
          name: "word",
          required: true,
          type: "string",
          example: "Aviation",
        },
      ],
      responses: {
        200: {
          description: "Mot trouvé.",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/DictionaryEntry",
            },
          },
        },
        404: {
          description: "Mot non trouvé.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },

  "/dictionary/{id}": {
    put: {
      tags: ["Dictionary"],
      summary: "Mettre à jour la définition d'un mot",
      description: "Modifie la définition d'un mot existant dans le dictionnaire.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          type: "integer",
          example: 1,
        },
        {
          in: "body",
          name: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              word: {
                type: "string",
                example: "Updated word.",
              },
              definition: {
                type: "string",
                example: "Updated definition of the word.",
              },
              image_url:{
                type: "string",
                example: "https://exemple.com/image.jpg",
                description: "URL de l'image associée au mot (facultatif)",
              }
            },
            required: ["definition"],
          },
        },
      ],
      responses: {
        200: {
          description: "Mot mis à jour avec succès.",
        },
        400: {
          description: "Données invalides.",
        },
        404: {
          description: "Mot non trouvé.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },

    delete: {
      tags: ["Dictionary"],
      summary: "Supprimer un mot du dictionnaire",
      description: "Supprime un mot du dictionnaire à partir de son identifiant.",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          type: "integer",
          example: 1,
        },
      ],
      responses: {
        200: {
          description: "Mot supprimé avec succès.",
        },
        404: {
          description: "Mot non trouvé.",
        },
        500: {
          description: "Erreur interne du serveur.",
        },
      },
    },
  },

  definitions: {
    DictionaryEntry: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 1,
        },
        word: {
          type: "string",
          example: "Aviation",
        },
        definition: {
          type: "string",
          example: "The design, development, production, operation, and use of aircraft.",
        },
      },
    },
  },
};
