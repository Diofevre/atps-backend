require("dotenv").config();

/**
 * Vérifie si une chaîne de caractères est une URL valide
 * @param {string} str - La chaîne à vérifier
 * @returns {boolean} - true si c'est une URL, sinon false
 */
const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Génère une URL publique pour accéder à une image stockée sur S3
 * @param {string} key - Le chemin de l'image dans le bucket (ex: "questions/image1.png")
 * @returns {string} - URL publique de l'image
 */
const getImageUrl = (key, folder) => {

  // Vérifier si key est déjà une URL, si oui, la retourner directement
  if (isValidUrl(key)) {
    return key;
  }

  // Construire l'URL publique S3
  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${folder}/${key}`;

  return url;
};

module.exports = { getImageUrl };
