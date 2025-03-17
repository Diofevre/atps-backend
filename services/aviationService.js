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
        `SELECT explanation 
         FROM questions 
         WHERE explanation REGEXP ?
         LIMIT 5`,
        [keywords]
      );

      return rows.map(row => row.explanation);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  static async currectQuestions(question_id) {
    if (question_id === undefined || question_id === null) {
      return [];
    } 
    try {
      const [rows] = await pool.execute(
        `SELECT question_text, options, answer 
         FROM questions 
         WHERE id = ?`, 
        [question_id]
      );
      // Transformer les résultats et parser 'options' si nécessaire
      return rows.map(row => ({
        question_text: row.question_text,
        options: row.options, 
        answer: row.answer,
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      throw error;
    }
  }
  
}

module.exports = AviationService;