module.exports = {
    "/videos/topic/{topic_id}/search/{keyword}": {
      get: {
        tags: ["Videos"],
        summary: "Récupérer les vidéos par topic et mot-clé",
        description: "Retourne une liste de vidéos associées à un topic donné, avec la possibilité de filtrer par un mot-clé dans le titre ou la description des vidéos.",
        parameters: [
          {
            in: "path",
            name: "topic_id",
            required: true,
            schema: {
              type: "string",
              example: "38"
            },
            description: "ID du topic pour lequel récupérer les vidéos"
          },
          {
            in: "path",
            name: "keyword",
            required: false,
            schema: {
              type: "string",
              example: " "
            },
            description: "Mot-clé optionnel pour filtrer les vidéos par titre ou description"
          }
        ],
        responses: {
          200: {
            description: "Liste des vidéos pour le topic donné avec les informations associées",
            schema: {
              type: "object",
              properties: {
                topic: {
                  type: "string",
                  example: "063 - Flight Planning and Monitoring"
                },
                channel_name: {
                  type: "string",
                  example: "ATPL class"
                },
                channel_profile_image: {
                  type: "string",
                  example: "https://yt3.ggpht.com/ytc/AAUvwng_exampleprofileimage"
                },
                genre: {
                  type: "string",
                  example: "Educational"
                },
                language: {
                  type: "string",
                  example: "English"
                },
                videos: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        example: "ATPL Flight Planning - Class 1: Introduction and the Runway"
                      },
                      youtube_url: {
                        type: "string",
                        example: "https://www.youtube.com/watch?v=tT-AheNrwrc"
                      },
                      duration: {
                        type: "string",
                        example: "20:15"
                      },
                      description: {
                        type: "string",
                        example: "Introduction to flight planning and runway considerations."
                      },
                      thumbnail_url: {
                        type: "string",
                        example: "https://img.youtube.com/vi/tT-AheNrwrc/default.jpg"
                      },
                      like: {
                        type: "number",
                        example: 2
                      },
                      dislike: {
                        type: "number",
                        example: 1
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Requête mal formulée",
          },
          404: {
            description: "Aucune vidéo trouvée pour ce topic ou mot-clé",
          },
          500: {
            description: "Erreur interne du serveur",
          }
        }
      }
    },
    "/videos/{video_id}": {
      get: {
        tags: ["Videos"],
        summary: "Récupérer une vidéo par son ID",
        description: "Retourne les informations détaillées d'une vidéo associée à un ID spécifique.",
        parameters: [
          {
            in: "path",
            name: "video_id",
            required: true,
            schema: {
              type: "number",
              example: 1,
            },
            description: "ID unique de la vidéo à récupérer",
          },
        ],
        responses: {
          200: {
            description: "Détails de la vidéo pour l'ID donné",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "number",
                      example: 1,
                      description: "Identifiant unique de la vidéo",
                    },
                    title: {
                      type: "string",
                      example: "ATPL Radio Navigation - Class 1: Radio Wave Theory",
                      description: "Titre de la vidéo",
                    },
                    youtube_url: {
                      type: "string",
                      example: "https://www.youtube.com/watch?v=fVsgr79at5k",
                      description: "URL YouTube de la vidéo",
                    },
                    duration: {
                      type: "string",
                      example: "14:00",
                      description: "Durée de la vidéo au format HH:MM",
                    },
                    description: {
                      type: "string",
                      example: "Introduction to radio wave fundamentals and their applications in aviation navigation.",
                      description: "Description de la vidéo",
                    },
                    thumbnail_url: {
                      type: "string",
                      example: "https://img.youtube.com/vi/fVsgr79at5k/default.jpg",
                      description: "URL de la miniature de la vidéo",
                    },
                    topic: {
                      type: "string",
                      example: "062 - Radio Navigation",
                      description: "Nom du sujet auquel la vidéo est associée",
                    },
                    likes: {
                      type: "number",
                      example: 1,
                      description: "Nombre de likes pour cette vidéo",
                    },
                    dislikes: {
                      type: "number",
                      example: 0,
                      description: "Nombre de dislikes pour cette vidéo",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Requête mal formulée (exemple : ID manquant ou invalide)",
          },
          404: {
            description: "Aucune vidéo trouvée pour l'ID donné",
          },
          500: {
            description: "Erreur interne du serveur",
          },
        },
      },
    },
    definitions: {
      Video: {
        type: "object",
        properties: {
          title: {
            type: "string",
            example: "ATPL Flight Planning - Class 1: Introduction and the Runway"
          },
          youtube_url: {
            type: "string",
            example: "https://www.youtube.com/watch?v=tT-AheNrwrc"
          },
          duration: {
            type: "string",
            example: "20:15"
          },
          description: {
            type: "string",
            example: "Introduction to flight planning and runway considerations."
          },
          thumbnail_url: {
            type: "string",
            example: "https://img.youtube.com/vi/tT-AheNrwrc/default.jpg"
          }
        }
      },
      Topic: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            example: "063 - Flight Planning and Monitoring"
          },
          channel_name: {
            type: "string",
            example: "ATPL class"
          },
          channel_profile_image: {
            type: "string",
            example: "https://yt3.ggpht.com/ytc/AAUvwng_exampleprofileimage"
          },
          genre: {
            type: "string",
            example: "Educational"
          },
          language: {
            type: "string",
            example: "English"
          },
          videos: {
            type: "array",
            items: {
              $ref: "#/definitions/Video"
            }
          }
        }
      }
    }
  };
  