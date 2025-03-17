module.exports = {
    "/create-checkout-session": {
      "post": {
        "tags": ["Subscription"],
        "summary": "Créer une session de paiement Stripe",
        "description": "Crée une session de paiement Stripe pour un abonnement avec un choix de durée.",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "description": "Données nécessaires pour créer la session",
            "schema": {
              "type": "object",
              "properties": {
                "plan": {
                  "type": "string",
                  "enum": ["standard", "premium"],
                  "example": "premium",
                  "description": "Plan d'abonnement sélectionné"
                },
                "billingCycle": {
                  "type": "integer",
                  "enum": [1, 3, 6, 12],
                  "example": 3,
                  "description": "Durée de l'abonnement en mois"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Session de paiement créée avec succès",
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "example": "cs_test_123456789",
                  "description": "ID de la session Stripe"
                },
                "url": {
                  "type": "string",
                  "example": "https://checkout.stripe.com/pay/cs_test_123456789",
                  "description": "URL de la session Stripe pour procéder au paiement"
                }
              }
            }
          },
          "400": {
            "description": "Mauvaise requête - Paramètres invalides"
          },
          "401": {
            "description": "Non autorisé - Token invalide ou manquant"
          },
          "500": {
            "description": "Erreur interne du serveur"
          }
        }
      }
    },
    "/subscription/upgrade": {
      "post": {
        "tags": ["Subscription"],
        "summary": "Upgrade ou downgrade un abonnement",
        "description": "Permet à un utilisateur de changer son abonnement entre standard et premium avec une durée personnalisée.",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "required": true,
            "description": "Données nécessaires pour l'upgrade/downgrade",
            "schema": {
              "type": "object",
              "properties": {
                "newPlan": {
                  "type": "string",
                  "enum": ["standard", "premium"],
                  "example": "premium",
                  "description": "Nouveau plan d'abonnement"
                },
                "billingCycle": {
                  "type": "integer",
                  "enum": [1, 3, 6, 12],
                  "example": 6,
                  "description": "Durée de l'abonnement en mois"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Abonnement mis à jour avec succès",
            "schema": {
              "type": "object",
              "properties": {
                "success": { "type": "boolean", "example": true },
                "message": { "type": "string", "example": "Subscription updated to premium (6 months)" }
              }
            }
          },
          "400": {
            "description": "Mauvaise requête - Paramètres invalides"
          },
          "401": {
            "description": "Non autorisé - Token invalide ou manquant"
          },
          "500": {
            "description": "Erreur interne du serveur"
          }
        }
      }
    },  
  
    "/subscription/cancel": {
      post: {
        tags: ["Subscription"],
        summary: "Annuler un abonnement",
        description: "Annule l'abonnement de l'utilisateur à la fin de la période de facturation.",
        responses: {
          200: {
            description: "Abonnement annulé avec succès",
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                message: { type: "string", example: "Subscription will be canceled at the end of the billing period" }
              }
            }
          },
          400: {
            description: "Mauvaise requête - Utilisateur ou abonnement non trouvé"
          },
          401: {
            description: "Non autorisé - Token invalide ou manquant"
          },
          500: {
            description: "Erreur interne du serveur"
          }
        }
      }
    },
  
    "/subscription/resume": {
      post: {
        tags: ["Subscription"],
        summary: "Reprendre un abonnement annulé",
        description: "Permet à un utilisateur d'annuler l'annulation et de conserver son abonnement actif.",
        responses: {
          200: {
            description: "Abonnement réactivé avec succès",
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                message: { type: "string", example: "Subscription reactivated successfully" }
              }
            }
          },
          400: {
            description: "Mauvaise requête - Abonnement déjà actif ou utilisateur introuvable"
          },
          401: {
            description: "Non autorisé - Token invalide ou manquant"
          },
          500: {
            description: "Erreur interne du serveur"
          }
        }
      }
    },
  
    "/subscription/renew": {
      post: {
        tags: ["Subscription"],
        summary: "Renouveler un abonnement après expiration",
        description: "Permet à un utilisateur de souscrire à un nouvel abonnement après expiration.",
        parameters: [
          {
            name: "body",
            in: "body",
            required: true,
            description: "Données nécessaires pour renouveler l'abonnement",
            schema: {
              type: "object",
              properties: {
                plan: {
                  type: "string",
                  enum: ["standard", "premium"],
                  example: "premium",
                  description: "Plan de l'abonnement à renouveler"
                }
              }
            }
          }
        ],
        responses: {
          200: {
            description: "Nouvel abonnement créé avec succès",
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                message: { type: "string", example: "Subscription renewed with plan premium" }
              }
            }
          },
          400: {
            description: "Mauvaise requête - Paramètres invalides ou utilisateur introuvable"
          },
          401: {
            description: "Non autorisé - Token invalide ou manquant"
          },
          500: {
            description: "Erreur interne du serveur"
          }
        }
      }
    },
    "/subscription/billing-portal": {
  get: {
    tags: ["Subscription"],
    summary: "Obtenir l'URL du portail de facturation Stripe",
    description: "Génère un lien permettant à l'utilisateur d'accéder à son portail de facturation Stripe.",
    responses: {
      200: {
        description: "URL du portail de facturation générée avec succès",
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            url: {
              type: "string",
              example: "https://billing.stripe.com/session/xyz123",
              description: "URL du portail Stripe où l'utilisateur peut gérer ses informations de paiement."
            }
          }
        }
      },
      400: {
        description: "Mauvaise requête - Utilisateur introuvable ou ID Stripe manquant"
      },
      401: {
        description: "Non autorisé - Token invalide ou manquant"
      },
      500: {
        description: "Erreur interne du serveur"
      }
    }
  }
}

  };
  