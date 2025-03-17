const { Op } = require("sequelize");
const {
  Chapter,
  SubChapter,
  ExamUser,
  Question,
  Topic,
  Exam,
} = require("../models");
const sequelize = require("../config/db");
const { getRandomQuestions } = require("./questionController");
const { getImageUrl } = require("../services/s3Service");


const createExam = async (req, res) => {
  try {
    const { topicId, filters } = req.body;
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Vérifications initiales
    if (!topicId) {
      return res
        .status(400)
        .json({ error: "Tous les paramètres requis doivent être fournis." });
    }

    const topic = await Topic.findByPk(topicId);
    if (!topic) {
      return res
        .status(404)
        .json({ error: "Le topic spécifié est introuvable." });
    }

    const number_of_questions = topic.exam_number_question;
    const exam_duration = topic.exam_duration;

    const existingExam = await Exam.findOne({
      where: { topic_id: topicId, user_id: userId, is_finished: null },
    });

    if (existingExam) {
      return await handleExistingExam(topicId, topic.topic_name, userId, exam_duration, res);
    }

    return await handleNewExam(
      topicId,
      topic.topic_name,
      userId,
      number_of_questions,
      exam_duration,
      filters,
      res
    );
  } catch (error) {
    console.error("Erreur lors de la création de l'examen:", error);
    return res
      .status(500)
      .json({ error: "Erreur lors de la création de l'examen." });
  }
};

const handleNewExam = async (
  topicId,
  topic_name,
  userId,
  number_of_questions,
  exam_duration,
  filters,
  res
) => {
  const chapter = await Chapter.findAll({
    where: { topic_id: topicId },
    include: {
      model: SubChapter,
      as: "subChapters",
      attributes: ["id"],
    },
  });

  const sub_chapters = chapter.reduce((acc, chap) => {
    return acc.concat(chap.subChapters.map((subChapter) => subChapter.id));
  }, []);

  // Récupérer les questions en fonction des filtres
  const questions = await getRandomQuestions(
    filters,
    sub_chapters,
    number_of_questions,
    userId
  );

  // Vérification du nombre de questions obtenues
  if (questions.length < number_of_questions) {
    return res.status(400).json({
      error: `Nombre insuffisant de questions. Trouvé : ${questions.length}, Requis : ${number_of_questions}.`,
    });
  }

  // Créer un nouvel examen
  const exam = await Exam.create({
    user_id: userId,
    topic_id: topicId,
    number_of_questions,
    exam_duration,
  });

  const examUsersPromises = questions.map((question) =>
    ExamUser.create({
      exam_id: exam.id,
      question_id: question.id,
    })
  );

  await Promise.all(examUsersPromises); // Exécute toutes les requêtes en parallèle

  const savedExamQuestions = await ExamUser.findAll({
    where: { exam_id: exam.id },
    include: [
      {
        model: Question,
        as: "question",
      },
    ],
  });

  const savedQuestionsExam = savedExamQuestions.map((userAnswer) => {
    const question = userAnswer.question;
  
    return {
      ...question, 
      question_images: question.question_images
        ? getImageUrl(question.question_images, "question") 
        : null,
      explanation_images: question.explanation_images
       ? getImageUrl(question.explanation_images, "explanation")
        : null,
    };
  });

  // Retourner les données de l'examen créé
  return res.status(201).json({
    exam_id: exam.id,
    topic_name,
    total_question: savedExamQuestions.length,
    exam_duration,
    questions: savedQuestionsExam,
  });
};

const handleExistingExam = async (topicId, topic_name, userId, exam_duration, res) => {
  // Vérifier si un examen est déjà en cours pour ce topic et l'utilisateur
  const existingExam = await Exam.findOne({
    where: { topic_id: topicId, user_id: userId, is_finished: null },
  });

  const exam_id = existingExam.id;

  const savedExamQuestions = await ExamUser.findAll({
    where: { exam_id: exam_id },
    include: [
      {
        model: Question,
        as: "question",
      },
    ],
  });

  const savedQuestionsExam = savedExamQuestions.map((userAnswer) => {
    const question = userAnswer.question;
  
    return {
      ...question, 
      question_images: question.question_images
        ? getImageUrl(question.question_images, "question") 
        : null,
      explanation_images: question.explanation_images
       ? getImageUrl(question.explanation_images, "explanation")
        : null,
    };
  });

  // Retourner les données de l'examen existant
  return res.status(200).json({
    exam_id: exam_id,
    topic_name,
    total_question: savedExamQuestions.length,
    exam_duration,
    questions: savedQuestionsExam,
  });
};

const reinitexam = async (req, res) => {
  const userId = req.auth?.userId; // Vérification sécurisée
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const { exam_id } = req.body;
  if (!exam_id) {
    return res.status(400).json({ error: "Invalid or missing parameters" });
  }

  try {
    const exam = await Exam.findByPk(exam_id,{
      include: [
        {
          model: Topic,
          as: "topic",
          attributes: ["topic_name"]
        },
      ],
    });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }


    if (!exam.timespent) {
      return res
        .status(400)
        .json({ error: "Il faut valider l'exam avant de le reinitialiser" });
    }

    // Supposons que exam.exam_duration et exam.timespent soient des chaînes de format "HH:mm:ss"
    const parseDurationToMs = (duration) => {
      const [hours, minutes, seconds] = duration.split(":").map(Number);
      return (hours * 60 * 60 + minutes * 60 + seconds) * 1000; // Conversion en millisecondes
    };

    const examDurationMs = parseDurationToMs(exam.exam_duration);
    const timespentMs = parseDurationToMs(exam.timespent);

    // Additionner les durées
    const totalDurationMs = examDurationMs + timespentMs;

    // Convertir le résultat en format hh:mm:ss
    const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
    const minutes = Math.floor(
      (totalDurationMs % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((totalDurationMs % (1000 * 60)) / 1000);

    // Formatage
    const formattedDuration = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    // Créer un nouvel examen
    const new_exam = await Exam.create({
      user_id: userId,
      topic_id: exam.topic_id,
      number_of_questions: exam.number_of_questions,
      exam_duration: formattedDuration,
    });

    // Récupérer les questions liées à l'examen précédent
    const savedExamQuestions = await ExamUser.findAll({
      where: { exam_id: exam_id },
      include: [
        {
          model: Question,
          as: "question",
        },
      ],
    });

    if (savedExamQuestions.length === 0) {
      return res.status(404).json({ error: "No questions found for the exam" });
    }

    // Préparer les questions pour le nouvel examen
    const examUsersPromises = savedExamQuestions.map((question) =>
      ExamUser.create({
        exam_id: new_exam.id,
        question_id: question.question.id,
      })
    );

    await Promise.all(examUsersPromises);

    // Formatage des questions
    const savedQuestionsExam = savedExamQuestions.map((userAnswer) => {
      const question = userAnswer.question;
    
      return {
        ...question, 
        question_images: question.question_images
          ? getImageUrl(question.question_images, "question") 
          : null,
        explanation_images: question.explanation_images
         ? getImageUrl(question.explanation_images, "explanation")
          : null,
      };
    });

    // Retourner les données de l'examen réinitialisé
    return res.status(200).json({
      exam_id: new_exam.id,
      topic_name: exam.topic.topic_name,
      total_question: savedExamQuestions.length,
      exam_duration: formattedDuration,
      questions: savedQuestionsExam,
    });
  } catch (error) {
    console.error("Error reinitializing exam:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while reinitializing the exam." });
  }
};

const saveExam = async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const { exam_id, data } = req.body;
    if (!exam_id) {
      return res.status(400).json({ error: "Invalid or missing parameters" });
    }

    const exam = await Exam.findByPk(exam_id);

    // Convertir la durée de l'examen en secondes
    const [examHours, examMinutes, examSeconds] = exam.exam_duration
      .split(":")
      .map(Number);
    const totalExamSeconds = examHours * 3600 + examMinutes * 60 + examSeconds;

    // Calculer le temps écoulé
    const time_start = new Date(exam.updatedAt).getTime();
    const time_end = Date.now();
    const time_elapsed = time_end - time_start;

    // Convertir le temps écoulé en secondes
    const elapsedSeconds = Math.floor(time_elapsed / 1000);

    // Calculer le temps restant en secondes
    const remainingSeconds = Math.max(totalExamSeconds - elapsedSeconds, 0);

    // Convertir le temps restant en format hh:mm:ss
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const exam_duration_restant = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    
       // Crée des promesses pour obtenir toutes les questions par leurs IDs
       const questionPromises = data.map((data) =>
        Question.findOne({
          where: { id: data.question_id },
          attributes: ["answer"],
        })
      );


      // Attend que toutes les recherches (questions et testSubChapter) soient terminées
      const [questions] = await Promise.all([
        Promise.all(questionPromises),
      ]);


      // Crée des promesses de mise à jour pour chaque réponse utilisateur
      const updatePromises = data.map((data, index) => {
        const question = questions[index];

        // Vérifie si la question existe, sinon renvoie une erreur 404
        if (!question) {
          return Promise.resolve(
            res.status(404).json({
              message: `Question with id ${data.question_id} does not exist.`,
            })
          );
        }

        // Compare la réponse de l'utilisateur avec la réponse correcte
        const is_correct = question.answer === data.user_answer;

        // Crée une promesse pour mettre à jour la réponse de l'utilisateur
        return ExamUser.update(
          {
            user_answer: data.user_answer,
            is_correct: is_correct,
          },
          {
            where: {
              exam_id: exam_id, 
              question_id: data.question_id, // ID de la question
            },
          }
        );
      });

      // Attend que toutes les mises à jour soient terminées
      await Promise.all(updatePromises);


    await Exam.update(
      { is_finished: false, exam_duration: exam_duration_restant },
      { where: { id: exam_id, user_id: userId } }
    );
    return res.status(200).json({ message: "Examen sauvegardé" });
  } catch (error) {
    console.error("Error saving exam:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while saving the exam." });
  }
};

const validateExam = async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const { exam_id, filter=null, data } = req.body;
    if (!exam_id) {
      return res.status(400).json({ error: "Invalid or missing parameters" });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid or missing data parameter" });
    }
    

    const exam = await Exam.findByPk(exam_id, {
      include: {
        model: Topic,
        as: "topic",
        attributes: ["topic_name", "exam_duration"],
      },
    });

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }


    const number_of_questions = exam.number_of_questions;

    let timespent;
    let exam_duration_restant;

    if (exam.is_finished) {
      timespent = exam.timespent;
      exam_duration_restant = exam.exam_duration;
    } else {

       // Crée des promesses pour obtenir toutes les questions par leurs IDs
       const questionPromises = data.map((data) =>
        Question.findOne({
          where: { id: data.question_id },
          attributes: ["answer"],
        })
      );


      // Attend que toutes les recherches (questions et testSubChapter) soient terminées
      const [questions] = await Promise.all([
        Promise.all(questionPromises),
      ]);


      // Crée des promesses de mise à jour pour chaque réponse utilisateur
      const updatePromises = data.map((data, index) => {
        const question = questions[index];

        // Vérifie si la question existe, sinon renvoie une erreur 404
        if (!question) {
          return Promise.resolve(
            res.status(404).json({
              message: `Question with id ${data.question_id} does not exist.`,
            })
          );
        }

        // Compare la réponse de l'utilisateur avec la réponse correcte
        const is_correct = question.answer === data.user_answer;

        // Crée une promesse pour mettre à jour la réponse de l'utilisateur
        return ExamUser.update(
          {
            user_answer: data.user_answer,
            is_correct: is_correct,
          },
          {
            where: {
              exam_id: exam_id, 
              question_id: data.question_id, // ID de la question
            },
          }
        );
      });

      // Attend que toutes les mises à jour soient terminées
      await Promise.all(updatePromises);

      // Convertir la durée de l'examen en secondes
      const [examHours, examMinutes, examSeconds] = exam.exam_duration
        .split(":")
        .map(Number);
      const totalExamSeconds =
        examHours * 3600 + examMinutes * 60 + examSeconds;

      // Calculer le temps écoulé
      const time_start = new Date(exam.updatedAt).getTime();

      const time_end = Date.now();
      const time_elapsed = time_end - time_start;

      // Convertir en heures, minutes, secondes
      const te_hours = Math.floor(time_elapsed / (1000 * 60 * 60));
      const te_minutes = Math.floor(
        (time_elapsed % (1000 * 60 * 60)) / (1000 * 60)
      );
      const te_seconds = Math.floor((time_elapsed % (1000 * 60)) / 1000);

      // Formater en hh:mm:ss
      timespent = `${String(te_hours).padStart(2, "0")}:${String(
        te_minutes
      ).padStart(2, "0")}:${String(te_seconds).padStart(2, "0")}`;


      // Convertir le temps écoulé en secondes
      const elapsedSeconds = Math.floor(time_elapsed / 1000);

      // Calculer le temps restant en secondes
      const remainingSeconds = Math.max(totalExamSeconds - elapsedSeconds, 0);

      // Convertir le temps restant en format hh:mm:ss
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      exam_duration_restant = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    }

    const stats = await calculateExamStats(exam_id, number_of_questions);

    const filteredResults = await getExamDetails(exam_id, filter);
    const not_answer = exam.number_of_questions - stats.finishedQuestions;

    await Exam.update(
      {
        is_finished: true,
        exam_duration: exam_duration_restant,
        timespent: timespent,
        score: stats.score,
        finished_question: stats.finishedQuestions,
      },
      { where: { id: exam_id, user_id: userId } }
    );
    deleteExamsUnfinished(userId);
    return res.status(200).json({
      message: "Validation completed successfully.",
      exam_id,
      timeSpent: timespent,
      exam_duration: exam.topic.exam_duration,
      exam_duration_restant: exam_duration_restant,
      dateOfValidation: new Date().toISOString(),
      totalQuestions: exam.number_of_questions,
      correctAnswers: stats.correctCount,
      incorrectAnswers: stats.incorrectCount,
      notAnswered: not_answer,
      scorePercentage: stats.score,
      topic: exam.topic.topic_name,
      details: filteredResults,
    });
  } catch (error) {
    console.error("Error saving exam:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while saving the exam." });
  }
};


const getExamDetails = async (exam_id, filter = null) => {
  try {
    const examUsers = await ExamUser.findAll({
      where: { exam_id: exam_id },
      include: [
        {
          model: Question,
          as: "question",
        },
      ],
    });

    let filteredResults = examUsers;

    // Appliquer le filtre
    if (filter) {
      filteredResults = examUsers.filter((examUser) => {
        switch (filter) {
          case "correct":
            return examUser.is_correct === true;
          case "incorrect":
            return examUser.is_correct === false;
          case "no-answer":
            return examUser.user_answer === null;
          default:
            return true; // Pas de filtre si aucune correspondance
        }
      });
    }

    // Formater les résultats
    const result = filteredResults.map((examUser) => ({
      questionId: examUser.question.id,
      questionText: examUser.question.question_text,
      questionImages: getImageUrl(examUser.question.question_images, "question"),
      userAnswer: examUser.user_answer,
      isCorrect: examUser.is_correct,
      correctAnswer: examUser.question.answer,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching exam details:", error);
    throw error;
  }
};

const calculateExamStats = async (exam_id, number_of_questions) => {
  try {
    // Récupérer tous les ExamUser liés à l'examen
    const examUsers = await ExamUser.findAll({
      where: {
        exam_id: exam_id,
      },
    });

    // Initialiser les compteurs
    let correctCount = 0;
    let incorrectCount = 0;

    // Parcourir les réponses pour compter les correctes et incorrectes
    examUsers.forEach((examUser) => {
      if (examUser.is_correct === true) {
        correctCount++;
      } else if (examUser.is_correct === false) {
        incorrectCount++;
      }
    });

    // Calculer le nombre total de questions terminées
    const finishedQuestions = correctCount + incorrectCount;

    // Calculer le score (par exemple, pourcentage des réponses correctes)
    const score =
      number_of_questions > 0 ? (correctCount / number_of_questions) * 100 : 0;
    const formattedScore = parseFloat(score.toFixed(2));

    return {
      correctCount,
      incorrectCount,
      finishedQuestions,
      score: formattedScore,
    };
  } catch (error) {
    console.error("Error calculating exam stats:", error);
    throw error;
  }
};

const getUnfinishedExamsForUser = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Vérifier si userId est fourni
    if (!userId) {
      return res.status(401).json({ error: "User is not authenticated" });
    }

    const unfinishedExams = await Exam.findAll({
      where: {
        user_id: userId,
        is_finished: {
          [Op.ne]: null, // Examen dont is_finished n'est pas égal à null
        },
      },
      include: [
        {
          model: Topic,
          as: "topic",
          attributes: ["topic_name"],
        },
      ],
    });

    // Vérifier si des examens ont été trouvés
    if (!unfinishedExams || unfinishedExams.length === 0) {
      return res.status(404).json({ message: "No unfinished exams found" });
    }

    // Formatage des résultats
    const result = unfinishedExams.map((exam) => {
      return {
        exam_id: exam.id,
        topic: exam.topic?.topic_name || "Unknown",
        created_at: exam.createdAt,
        timespent: exam.timespent,
        is_finished: exam.is_finished,
        total_question: exam.number_of_questions,
        score: exam.score,
      };
    });

    // Retourner la réponse JSON
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching unfinished exams:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching exams" });
  }
};

const deleteExamsUnfinished = async (userId) => {
  const transaction = await sequelize.transaction();
  try {
    if (!userId) {
      return console.error({ error: "User not authenticated" });
    }
    const result = await Exam.destroy({
      where: {
        is_finished: null,
        user_id: userId,
      },
      transaction,
    });

    await transaction.commit();
    console.log(
      `Successfully deleted ${result} exam with null timespent and their related data.`
    );
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error deleting exam unfinished:", error);
    throw error;
  }
};

module.exports = {
  createExam,
  deleteExamsUnfinished,
  saveExam,
  validateExam,
  getUnfinishedExamsForUser,
  reinitexam,
};
