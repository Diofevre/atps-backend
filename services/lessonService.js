const pool = require('../config/database');

class AviationService {
  static async findRelevantExplanations(userQuestion) {
    try {
      const keywords = userQuestion.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(word => word.length > 3)
        .join('|');

      const [rows] = await pool.execute(
        `SELECT text 
         FROM content 
         WHERE text REGEXP ?
         LIMIT 5`,
        [keywords]
      );

      return rows.map(row => row.explanation);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  static async currectLessons(topic_lesson_id) {
    if (topic_lesson_id === undefined || topic_lesson_id === null) {
      return [];
    } 
    try {
      const [rows] = await pool.execute(
        `SELECT text
         FROM content 
         WHERE page_id = ?`, 
        [topic_lesson_id]
      );
      // Transformer les résultats et parser 'options' si nécessaire
      return rows.map(row => ({
        text: row.text,
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      throw error;
    }
  }
  
}

module.exports = AviationService;