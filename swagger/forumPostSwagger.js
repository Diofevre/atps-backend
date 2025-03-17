module.exports = {
  "/forum-posts": {
    get: {
      tags: ["Forum Posts"],
      summary: "Récupérer tous les posts",
      description:
        "Retourne une liste de tous les posts avec leurs hashtags associés",
        parameters: [
          {
            name: "keyword",  
            in: "query",     
            required: false,
            description:
              "Mot-clé pour filtrer les posts (optionnel). Si omis, tous les posts sont retournés.",
            schema: {
              type: "string",  
              example: "sports", 
            },
          },
        ],        
      responses: {
        200: {
          description: "Liste des posts",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/ForumPost",
            },
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    post: {
      tags: ["Forum Posts"],
      summary: "Créer un nouveau post",
      description:
        "Permet de créer un nouveau post. Si des hashtags sont fournis, ils seront ajoutés (créés si nécessaires).",
      parameters: [
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              category_id: {
                type: "integer",
                description: "ID de la catégorie du post",
              },
              title: {
                type: "string",
                example: "Titre du post",
                description: "Titre du post",
              },
              content: {
                type: "string",
                example: "Contenu du post",
                description: "Contenu détaillé du post",
              },
              image_url: {
                type: "string",
                example: "https://exemple.com/image.jpg",
                description: "URL de l'image associée au post (facultatif)",
              },
              hashtags: {
                type: "array",
                items: {
                  type: "string",
                  example: "sport",
                  description: "Liste des hashtags associés au post",
                },
                description: "Liste des hashtags à associer au post",
              },
            },
          },
        },
      ],
      responses: {
        201: {
          description: "Post créé avec succès",
          schema: {
            $ref: "#/definitions/ForumPost",
          },
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },
  "/forum-posts/{post_id}": {
    put: {
      tags: ["Forum Posts"],
      summary: "Modifier un post existant",
      description:
        "Permet de modifier un post existant et de mettre à jour ses hashtags associés",
      parameters: [
        {
          name: "post_id",
          in: "path",
          required: true,
          type: "integer",
          description: "ID du post à modifier",
        },
        {
          name: "body",
          in: "body",
          required: true,
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                example: "Nouveau titre du post",
                description: "Nouveau titre du post",
              },
              content: {
                type: "string",
                example: "Nouveau contenu du post",
                description: "Nouveau contenu détaillé du post",
              },
              image_url: {
                type: "string",
                example: "https://exemple.com/nouvelle-image.jpg",
                description:
                  "Nouvelle URL de l'image associée au post (facultatif)",
              },
              hashtags: {
                type: "array",
                items: {
                  type: "string",
                  example: "nouveauHashtag",
                  description: "Liste des hashtags associés au post",
                },
                description: "Liste des hashtags à associer au post",
              },
            },
          },
        },
      ],
      responses: {
        200: {
          description: "Post modifié avec succès",
          schema: {
            $ref: "#/definitions/ForumPost",
          },
        },
        404: {
          description: "Post non trouvé",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
    delete: {
      tags: ["Forum Posts"],
      summary: "Supprimer un post",
      description:
        "Permet de supprimer un post existant ainsi que ses relations avec les hashtags",
      parameters: [
        {
          name: "post_id",
          in: "path",
          required: true,
          type: "integer",
          description: "ID du post à supprimer",
        },
      ],
      responses: {
        200: {
          description: "Post supprimé avec succès",
        },
        404: {
          description: "Post non trouvé",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },

  "/forum-posts/id/{post_id}": {
    get: {
      tags: ["Forum Posts"],
      summary: "Récupérer un post par son ID",
      description:
        "Retourne un post spécifique en fonction de son ID avec ses hashtags et les infos de l'auteur.",
      parameters: [
        {
          name: "post_id",
          in: "path",
          required: true,
          description: "L'ID du post à récupérer",
          type: "integer",
          example: 1,
        },
      ],
      responses: {
        200: {
          description: "Détails du post",
          schema: {
            $ref: "#/definitions/ForumPost",
          },
        },
        404: {
          description: "Post non trouvé",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },

  "/forum-posts/user": {
    get: {
      tags: ["Forum Posts"],
      summary: "Récupérer tous les posts de l'utilisateur authentifié",
      description:
        "Retourne la liste des posts créés par l'utilisateur connecté.",
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: "Liste des posts de l'utilisateur",
          schema: {
            type: "array",
            items: {
              $ref: "#/definitions/ForumPost",
            },
          },
        },
        404: {
          description: "Aucun post trouvé pour cet utilisateur",
        },
        401: {
          description: "Utilisateur non authentifié",
        },
        500: {
          description: "Erreur interne du serveur",
        },
      },
    },
  },

  definitions: {
    ForumPost: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          example: 1,
        },
        user_id: {
          type: "string",
          example: "123",
        },
        category_id: {
          type: "integer",
          example: 2,
        },
        title: {
          type: "string",
          example: "Titre du post",
        },
        content: {
          type: "string",
          example: "Contenu du post",
        },
        image_url: {
          type: "string",
          example: "https://exemple.com/image.jpg",
        },
        createdAt: {
          type: "string",
          example: "2025-02-05T10:00:00Z",
        },
        updatedAt: {
          type: "string",
          example: "2025-02-05T10:00:00Z",
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Jean Dupont",
            },
            username: {
              type: "string",
              example: "jean123",
            },
            picture: {
              type: "string",
              example: "https://exemple.com/profile-picture.jpg",
            },
          },
        },
        Hashtag: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "#sport",
            },
          },
        },
      },
    },
  },
};
