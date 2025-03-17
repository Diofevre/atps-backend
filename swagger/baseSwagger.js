module.exports = {
  swagger: "2.0",
  info: {
    title: "API de Gestion des Réservations",
    description: "Une API pour gérer les réservations de chambres, y compris la création, modification, validation, refus et annulation des réservations.",
    version: "1.0.0"
  },
  host: process.env.BACK_URL,
  basePath: "/api",
  schemes: [process.env.SCHEME || "http"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter your Bearer token in the format **Bearer &lt;token&gt;**"
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};
