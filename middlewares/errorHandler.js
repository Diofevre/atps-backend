// Middleware pour gérer les erreurs
function errorHandler(err, req, res, next) {
    console.error(err.stack); // Affiche l'erreur dans la console pour le développement

    // Envoi d'une réponse générique en cas d'erreur
    res.status(500).json({
        message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
}

module.exports = errorHandler;
