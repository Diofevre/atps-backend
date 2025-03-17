module.exports = {
    "/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Récupérer les informations du tableau de bord",
        description: "Renvoie les statistiques et les informations du tableau de bord pour un utilisateur authentifié.",
       
        responses: {
          200: {
            description: "Les informations du tableau de bord ont été récupérées avec succès.",
           
          },
          500: {
            description: "Erreur interne du serveur.",
            
          },
        },
      },
    },
    "/dashboard/admin": {
      get: {
        tags: ["Dashboard"],
        summary: "Récupérer les informations du tableau de bord pour l'admin",
        description: "Renvoie les statistiques et les informations du tableau de bord pour l'admin.",
       
        responses: {
          200: {
            description: "Les informations du tableau de bord ont été récupérées avec succès.",
           
          },
          500: {
            description: "Erreur interne du serveur.",
            
          },
        },
      },
    },
  };
  