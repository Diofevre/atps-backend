module.exports = {
    "/forum-comments": {
        post: {
            tags: ["Forum Comments"],
            summary: "Créer un nouveau commentaire",
            description: "Permet de créer un nouveau commentaire pour un post. Peut aussi être une réponse à un autre commentaire.",
            parameters: [
                {
                    name: "body",
                    in: "body",
                    required: true,
                    schema: {
                        type: "object",
                        properties: {
                            post_id: { type: "integer", description: "ID du post" },
                            content: { type: "string", description: "Contenu du commentaire" },
                            parent_comment_id: { type: "integer", exemple: null,description: "ID du commentaire parent (facultatif)" },
                        },
                    },
                },
            ],
            responses: {
                201: {
                    description: "Commentaire créé avec succès",
                },
                500: {
                    description: "Erreur interne du serveur",
                },
            },
        },
    },
    "/forum-comments/posts/{post_id}/": {
        get: {
            tags: ["Forum Comments"],
            summary: "Récupérer tous les commentaires d'un post",
            description: "Retourne tous les commentaires pour un post, y compris les réponses.",
            parameters: [
                {
                    name: "post_id",
                    in: "path",
                    required: true,
                    type: "integer",
                    description: "ID du post",
                },
            ],
            responses: {
                200: {
                    description: "Liste des commentaires",
                    schema: {
                        type: "array",
                        items: { $ref: "#/definitions/Comment" },
                    },
                },
                500: {
                    description: "Erreur interne du serveur",
                },
            },
        },
    },
    "/forum-comments/{comment_id}": {
        get: {
            tags: ["Forum Comments"],
            summary: "Récupérer un commentaire et ses réponses",
            description: "Retourne un commentaire spécifique ainsi que ses réponses (le cas échéant).",
            parameters: [
                {
                    name: "comment_id",
                    in: "path",
                    required: true,
                    type: "integer",
                    description: "ID du commentaire",
                },
            ],
            responses: {
                200: {
                    description: "Détails du commentaire",
                    schema: { $ref: "#/definitions/Comment" },
                },
                500: {
                    description: "Erreur interne du serveur",
                },
            },
        },
        put: {
            tags: ["Forum Comments"],
            summary: "Mettre à jour un commentaire",
            description: "Permet de modifier un commentaire existant.",
            parameters: [
                {
                    name: "comment_id",
                    in: "path",
                    required: true,
                    type: "integer",
                    description: "ID du commentaire à mettre à jour",
                },
                {
                    name: "body",
                    in: "body",
                    required: true,
                    schema: {
                        type: "object",
                        properties: {
                            content: { type: "string", description: "Nouveau contenu du commentaire" },
                        },
                    },
                },
            ],
            responses: {
                200: {
                    description: "Commentaire mis à jour avec succès",
                },
                500: {
                    description: "Erreur interne du serveur",
                },
            },
        },
        delete: {
            tags: ["Forum Comments"],
            summary: "Supprimer un commentaire",
            description: "Permet de supprimer un commentaire.",
            parameters: [
                {
                    name: "comment_id",
                    in: "path",
                    required: true,
                    type: "integer",
                    description: "ID du commentaire à supprimer",
                },
            ],
            responses: {
                200: {
                    description: "Commentaire supprimé avec succès",
                },
                500: {
                    description: "Erreur interne du serveur",
                },
            },
        },
    },
};
