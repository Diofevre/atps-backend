const {UserAnswer, Question} = require('../models');

const getAnswersByStatus = async (req, res) => {
    try {
      const { testId, isCorrect } = req.query;
  
      // Validation des paramètres
      if (!testId || typeof isCorrect === 'undefined') {
        return res.status(400).json({
          message: "Invalid input. Please provide testId and isCorrect (true or false).",
        });
      }
  
      // Récupérer les réponses utilisateur pour le test
      const answers = await UserAnswer.findAll({
        where: {
          test_id: testId,
          is_correct: isCorrect === 'true', // Convertir la chaîne en booléen
        },
        include: [
          {
            model: Question,
            as: 'questions',
            attributes: ['id', 'question_text', 'answer'], // Limiter les colonnes récupérées
          },
        ],
      });
  
      // Formatter les réponses
      const formattedAnswers = answers.map((answer) => ({
        questionId: answer.questions.id,
        questionText: answer.questions.question_text,
        userAnswer: answer.user_answer,
        isCorrect: answer.is_correct,
        correctAnswer: answer.is_correct ? null : answer.questions.answer,
      }));
  
      // Retourner les réponses formatées
      res.status(200).json({
        message: `Answers retrieved successfully for testId ${testId}.`,
        total: formattedAnswers.length,
        answers: formattedAnswers,
      });
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({
        message: "An error occurred while fetching answers.",
        error: error.message,
      });
    }
  };
  
  module.exports = {
    getAnswersByStatus
  }