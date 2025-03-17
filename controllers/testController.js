const {
  Chapter,
  Topic,
  TestSubChapter,
  UserAnswerTag,
  Tag,
  Test,
  UserAnswer,
  Question,
  SubChapter,
  ChatExplanation,
} = require("../models");
const { getRandomQuestions, getSearchQuestion } = require("./questionController");
const { createTestSubChapter } = require("./testSubChapterCotroller");
const sequelize = require("../config/db");
const { Op, where } = require("sequelize");
const { getImageUrl } = require("../services/s3Service");


// Fonction pour créer un test
const createTest = async (userId, total_question) => {
  try {
    const newTest = await Test.create({
      user_id: userId,
      is_finished: false,
      total_question: total_question,
      finished_question: 0,
      score: 0,
      timespent: null,
    });
    return newTest;
  } catch (error) {
    throw new Error(`Failed to create test: ${error.message}`);
  }
};

const executeTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  try {
    const {
      total_question,
      sub_chapters,
      testId = null,
      tryagainfilter = null,
      filter = null,
      nombre_question = null,
    } = req.body;

    if (testId) {
      return await reinitTest(
        userId,
        testId,
        tryagainfilter,
        nombre_question,
        transaction,
        res
      );
      //return await handleExistingTest(testId, transaction, res);
    }

    if (
      !userId ||
      !Array.isArray(sub_chapters) ||
      sub_chapters.length === 0 ||
      total_question <= 0
    ) {
      //await transaction.rollback();
      return res.status(400).json({
        message:
          "Invalid input. Please provide a valid userId, sub_chapters array, and total_question.",
      });
    }

    const subchapter = await SubChapter.findOne({
      where: { id: sub_chapters[0] },
      attributes: ["id"],
      include: {
        model: Chapter,
        as: "chapters",
        attributes: ["id"],
        include: {
          model: Topic,
          as: "topic",
          attributes: ["topic_name"],
        },
      },
      transaction,
    });

    const topic_name = subchapter.chapters.topic.topic_name;

    // Vérifier si les sub_chapters existent déjà pour cet userId
    const existingTest = await Test.findOne({
      where: {
        user_id: userId,
        is_finished: false,
        total_question,
        timespent: null,
      },
      include: [
        {
          model: TestSubChapter,
          as: "test_sub_chapters",
          where:
            sequelize.literal(`JSON_CONTAINS(sub_chapter_id, '${JSON.stringify(
              sub_chapters
            )}') 
          AND JSON_LENGTH(sub_chapter_id) = JSON_LENGTH('${JSON.stringify(
            sub_chapters
          )}')`),
        },
      ],
      transaction,
    });

    if (existingTest) {
      return await handleExistingTest(
        existingTest.id,
        userId,
        topic_name,
        transaction,
        res
      );
    }

    return await handleNewTest(
      filter,
      userId,
      total_question,
      sub_chapters,
      topic_name,
      transaction,
      res
    );
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while executing the operations.",
      error: error.message,
    });
  }
};

const handleExistingTest = async (
  test_id,
  userId,
  topic_name,
  transaction,
  res
) => {
  try {
    // Optimisation: Utilisation d'une seule requête avec eager loading
    const savedQuestions = await UserAnswer.findAll({
      include: [
        {
          model: TestSubChapter,
          as: "testSubChapter",
          where: { test_id },
          required: true,
        },
        {
          model: Question,
          as: "questions",
          include: [
            {
              model: SubChapter,
              as: "sub_chapter",
              attributes: ["sub_chapter_text"],
            },
            {
              model: ChatExplanation,
              as: "chatExplanations",
              attributes: ["explanation", "id"],
              required: false,
            },
          ],
        },
      ],
      transaction,
    });

    const formattedQuestions = await Promise.all(
      savedQuestions.map(async (entry) => {
        // Convertir les questions en JSON
        const questionData = entry.questions.toJSON();

        // Vérifier si l'image existe dans la question
        if (questionData.question_images) {
         

          const imageURL_q = getImageUrl(questionData.question_images, "question")
          
          // Remplacer le nom de l'image par l'URL
          questionData.question_images = imageURL_q;
        }
        if (questionData.explanation_images) {

          const imageURL_ex = getImageUrl(questionData.explanation_images, "explanation");

          questionData.explanation_images = imageURL_ex;
        }

        // Retourner les données de la question modifiée
        return questionData;
      })
    );

    // Une fois les questions formatées et mises à jour, vous pouvez procéder à la réponse.
    await transaction.commit();

    return res.status(200).json({
      test_id,
      topic_name,
      total_question: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while handling the existing test.",
      error: error.message,
    });
  }
};

const handleNewTest = async (
  filter,
  userId,
  total_question,
  sub_chapters,
  topic_name,
  transaction,
  res
) => {
  try {
    // Optimisation: Exécution parallèle des opérations indépendantes
    const [questions, test] = await Promise.all([
      getRandomQuestions(filter, sub_chapters, total_question, userId),
      createTest(userId, total_question, { transaction }),
    ]);

    const testSubChapter = await createTestSubChapter(test.id, sub_chapters, {
      transaction,
    });

    // Optimisation: Création en masse des réponses utilisateur
    const userAnswers = questions.map((question) => ({
      user_id: userId,
      question_id: question.id,
      testSubChapter_id: testSubChapter.id,
      user_answer: null,
      is_correct: null,
    }));

    await UserAnswer.bulkCreate(userAnswers, { transaction });
    await transaction.commit();
    // Optimisation: Utilisation d'une seule requête avec eager loading pour récupérer les questions
    const savedUserAnswer = await UserAnswer.findAll({
      where: { testSubChapter_id: testSubChapter.id },
      attributes: [], // Exclut tous les attributs de UserAnswer
      include: [
        {
          model: Question,
          as: "questions",
          include: [
            {
              model: SubChapter,
              as: "sub_chapter",
              attributes: ["sub_chapter_text"],
            },
            {
              model: ChatExplanation,
              as: "chatExplanations",
              attributes: ["explanation", "id"],
              required: false,
            },
          ],
        },
      ],
    });

    const savedQuestions = await Promise.all(
      savedUserAnswer.map(async (userAnswer) => {
        let questionData = userAnswer.questions.toJSON();

        // Construire les URLs des images Google Drive
        questionData.question_images = getImageUrl(questionData.question_images, "question")
        questionData.explanation_images = getImageUrl(questionData.explanation_images, "explanation")

        return questionData;
      })
    );

    return res.status(200).json({
      test_id: test.id,
      topic_name,
      total_question: savedUserAnswer.length,
      questions: savedQuestions,
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while creating a new test.",
      error: error.message,
    });
  }
};

const reinitTest = async (
  userId,
  test_id,
  filter,
  nombre_question,
  transaction,
  res
) => {
  let isTransactionExternal = !!transaction;
  if (!isTransactionExternal) {
    transaction = await sequelize.transaction();
  }

  try {
    // Vérifier d'abord si le test existe pour cet utilisateur
    const test = await Test.findOne({
      where: {
        id: test_id,
        user_id: userId,
      },
      include: [
        {
          model: TestSubChapter,
          as: "test_sub_chapters",
          attributes: ["id", "sub_chapter_id"],
        },
      ],
      transaction,
    });

    if (!test) {
      return res.status(404).json({
        message: "Test not found",
      });
    }
    const testSubChapter_id = test.test_sub_chapters[0]?.id;
    const subChapter_id = test.test_sub_chapters[0]?.sub_chapter_id;

    const subchapter = await SubChapter.findOne({
      where: { id: test.test_sub_chapters[0]?.sub_chapter_id[0] },
      attributes: ["id"],
      include: {
        model: Chapter,
        as: "chapters",
        attributes: ["id"],
        include: {
          model: Topic,
          as: "topic",
          attributes: ["topic_name"],
        },
      },
      transaction,
    });

    const topic_name = subchapter.chapters.topic.topic_name;
    // Construire la requête optimisée pour les filtres
    let userAnswersQuery = {
      where: { testSubChapter_id },
      transaction,
    };
    if (filter === "all") {
    } else {
      // Appliquer les filtres de manière optimisée
      if (filter === "incorrect") {
        userAnswersQuery.where.is_correct = false;
      } else if (filter === "no_answer") {
        userAnswersQuery.where.user_answer = null;
      } else if (["red", "green", "orange"].includes(filter)) {
        // Optimisation de la requête pour les tags
        const taggedAnswersQuery = `
    SELECT DISTINCT ua.id 
    FROM user_answers ua
    INNER JOIN user_answer_tags uat ON ua.id = uat.user_answer_id
    INNER JOIN tags t ON uat.tag_id = t.id
    WHERE ua.testSubChapter_id = :testSubChapterId
    AND t.name = :filter
  `;

        const taggedAnswers = await sequelize.query(taggedAnswersQuery, {
          replacements: {
            testSubChapterId: testSubChapter_id,
            filter,
          },
          type: sequelize.QueryTypes.SELECT,
          transaction,
        });

        const taggedIds = taggedAnswers.map((answer) => answer.id);
        if (taggedIds.length === 0) {
          return res.status(404).json({
            message: "Aucune réponse trouvée avec ce tag",
          });
        }
        userAnswersQuery.where.id = taggedIds;
        // Récupérer les réponses filtrées
        const userAnswers = await UserAnswer.findAll(userAnswersQuery);
      }
    }
    // Récupérer les réponses filtrées
    const userAnswers1 = await UserAnswer.findAll({
      ...userAnswersQuery,
      limit: nombre_question,
    });

    if (userAnswers1.length === 0) {
      return res.status(404).json({
        message: "Aucune réponse trouvée avec ces critères",
      });
    }
    const newtest = await createTest(userId, nombre_question, { transaction });
    const testSubChapter = await createTestSubChapter(
      newtest.id,
      subChapter_id,
      { transaction }
    );

    // Optimisation: Création en masse des réponses utilisateur
    const userAnswers = userAnswers1.map((question) => ({
      user_id: userId,
      question_id: question.question_id,
      testSubChapter_id: testSubChapter.id,
      user_answer: null,
      is_correct: null,
    }));

    await UserAnswer.bulkCreate(userAnswers, { transaction });
    await transaction.commit();

    // Optimisation: Utilisation d'une seule requête avec eager loading pour récupérer les questions
    const savedQuestions = await Question.findAll({
      include: [
        {
          model: SubChapter,
          as: "sub_chapter",
          attributes: ["sub_chapter_text"],
        },
        {
          model: ChatExplanation,
          as: "chatExplanations",
          attributes: ["explanation", "id"],
          where: { user_id: userId },
          required: false,
        },
      ],
      where: {
        id: userAnswers1.map((q) => q.question_id),
      },
    });

    if (!isTransactionExternal) {
      await transaction.commit();
    }


    const savedQuestions2 = await Promise.all(
      savedQuestions.map(async (question) => {
        let questionData = question.toJSON();

        // Construire les URLs des images Google Drive
        questionData.question_images =  getImageUrl(questionData.question_images, "question");
        questionData.explanation_images = getImageUrl(questionData.explanation_images, "explanation");

        return questionData;
      })
    );

    return res.status(200).json({
      test_id: newtest.id,
      topic_name,
      total_question: savedQuestions.length,
      questions: savedQuestions2,
    });
  } catch (error) {
    if (!isTransactionExternal && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error resetting test:", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la réinitialisation du test",
      error: error.message,
    });
  }
};

const saveTest = async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { testId, data } = req.body;

    // Validation des données d'entrée
    if (!testId) {
      return res.status(400).json({
        message: "Invalid input. Please provide testId.",
      });
    }

    // Crée des promesses pour obtenir toutes les questions par leurs IDs
    const questionPromises = data.map((data) =>
      Question.findOne({
        where: { id: data.question_id },
        attributes: ["answer"],
      })
    );

    // Crée une promesse pour obtenir le TestSubChapter correspondant au testId
    const testSubChapterPromise = TestSubChapter.findOne({
      where: { test_id: testId },
      attributes: ["id"],
    });

    // Attend que toutes les recherches (questions et testSubChapter) soient terminées
    const [questions, testSubChapter] = await Promise.all([
      Promise.all(questionPromises),
      testSubChapterPromise,
    ]);

    // Vérifie si le TestSubChapter est trouvé, sinon renvoie une erreur 404
    if (!testSubChapter) {
      return res.status(404).json({
        message: `TestSubChapter with test_id ${testId} does not exist.`,
      });
    }

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
      return UserAnswer.update(
        {
          user_answer: data.user_answer,
          is_correct: is_correct,
        },
        {
          where: {
            testSubChapter_id: testSubChapter.id, // Utilise l'ID de TestSubChapter récupéré plus tôt
            user_id: userId, // ID de l'utilisateur
            question_id: data.question_id, // ID de la question
          },
        }
      );
    });

    // Attend que toutes les mises à jour soient terminées
    await Promise.all(updatePromises);

    // Vérifier si le test existe
    const test = await Test.findByPk(testId, {
      include: [
        {
          model: TestSubChapter,
          as: "test_sub_chapters",
          include: [
            {
              model: UserAnswer,
              as: "user_answers",
              include: [
                {
                  model: Question,
                  as: "questions",
                },
              ],
            },
          ],
        },
      ],
    });

    if (!test) {
      return res.status(404).json({
        message: "Test not found.",
      });
    }

    const time_start = new Date(test.updatedAt);
    const time_end = new Date();

    // Calculate the difference in milliseconds
    const diff = time_end - time_start;

    // Convert the difference to hours, minutes, and seconds
    const hours = Math.floor(diff / 3600000); // 1 hour = 3600000 ms
    const minutes = Math.floor((diff % 3600000) / 60000); // 1 minute = 60000 ms
    const seconds = Math.floor((diff % 60000) / 1000); // 1 second = 1000 ms

    // Format as hh:mm:ss
    const timespent = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // Update the fields
    if (test.timespent) {
      const [existingHours, existingMinutes, existingSeconds] = test.timespent
        .split(":")
        .map(Number);
      const totalSeconds =
        existingHours * 3600 +
        existingMinutes * 60 +
        existingSeconds +
        diff / 1000;

      const newHours = Math.floor(totalSeconds / 3600);
      const newMinutes = Math.floor((totalSeconds % 3600) / 60);
      const newSeconds = Math.floor(totalSeconds % 60);

      test.timespent = `${String(newHours).padStart(2, "0")}:${String(
        newMinutes
      ).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;
    } else {
      test.timespent = timespent;
    }

    // Calculer le score et finished_question
    let correctAnswers = 0;
    let finished_question = 0;
    let totalQuestions = 0;

    test.test_sub_chapters.forEach((subChapter) => {
      subChapter.user_answers.forEach((answer) => {
        const question = answer.questions;
        totalQuestions++;
        if (answer.user_answer != null) {
          finished_question++;
          if (answer.user_answer === question.answer) {
            correctAnswers++;
          }
        }
      });
    });

    const score = ((correctAnswers / totalQuestions) * 100).toFixed(2);

    test.score = parseFloat(score);
    test.finished_question = finished_question;
    test.total_question = totalQuestions;

    // Sauvegarder les changements
    await test.save();

    // Répondre avec le test mis à jour
    res.status(200).json({
      message: "Test updated successfully.",
      test: {
        test_id: test.id,
        timespent: test.timespent,
        total_question: test.total_question,
        finished_question: test.finished_question,
        score: test.score,
      },
    });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({
      message: "An error occurred while updating the test.",
      error: error.message,
    });
  }
};

const validateTest = async (req, res) => {
  const userId = req.auth.userId;
  try {
    const { testId, filter = null, data } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!testId) {
      return res.status(400).json({
        message: "Invalid input. Please provide testId",
      });
    }

    const testfinished = await Test.findByPk(testId);

    if (!testfinished.is_finished) {
      // Crée des promesses pour obtenir toutes les questions par leurs IDs
      const questionPromises = data.map((data) =>
        Question.findOne({
          where: { id: data.question_id },
          attributes: ["answer"],
        })
      );

      // Crée une promesse pour obtenir le TestSubChapter correspondant au testId
      const testSubChapterPromise = TestSubChapter.findOne({
        where: { test_id: testId },
        attributes: ["id"],
      });

      // Attend que toutes les recherches (questions et testSubChapter) soient terminées
      const [questions, testSubChapter] = await Promise.all([
        Promise.all(questionPromises),
        testSubChapterPromise,
      ]);

      // Vérifie si le TestSubChapter est trouvé, sinon renvoie une erreur 404
      if (!testSubChapter) {
        return res.status(404).json({
          message: `TestSubChapter with test_id ${testId} does not exist.`,
        });
      }

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
        return UserAnswer.update(
          {
            user_answer: data.user_answer,
            is_correct: is_correct,
          },
          {
            where: {
              testSubChapter_id: testSubChapter.id, // Utilise l'ID de TestSubChapter récupéré plus tôt
              user_id: userId, // ID de l'utilisateur
              question_id: data.question_id, // ID de la question
            },
          }
        );
      });

      // Attend que toutes les mises à jour soient terminées
      await Promise.all(updatePromises);
    }

    const test = await Test.findOne({
      where: {
        id: testId,
        user_id: userId,
      },
      attributes: ["id", "updatedAt", "timespent", "total_question"],
      include: [
        {
          model: TestSubChapter,
          as: "test_sub_chapters",
          attributes: ["id"],
          include: [
            {
              model: UserAnswer,
              as: "user_answers",
              attributes: ["id", "user_answer"],
              include: [
                {
                  model: UserAnswerTag,
                  as: "user_answer_tags",
                  attributes: ["id"],
                  include: [
                    {
                      model: Tag,
                      as: "tags",
                      attributes: ["name"],
                    },
                  ],
                  required: false,
                },
                {
                  model: Question,
                  as: "questions",
                  attributes: ["id", "question_text", "answer", "options", "question_images"],
                  include: [
                    {
                      model: SubChapter,
                      as: "sub_chapter",
                      attributes: ["id"],
                      include: [
                        {
                          model: Chapter,
                          as: "chapters",
                          attributes: ["id"],
                          include: [
                            {
                              model: Topic,
                              as: "topic",
                              attributes: ["topic_name"],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    const timeEnd = new Date();
    const timeDiff = timeEnd - new Date(test.updatedAt);

    const formatTime = (totalSeconds) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    };

    const totalTimeInSeconds = test.timespent
      ? (() => {
          const [h, m, s] = test.timespent.split(":").map(Number);
          return h * 3600 + m * 60 + s + timeDiff / 1000;
        })()
      : timeDiff / 1000;

    let total_timespent;
    if (!testfinished.is_finished) {
      // Calcul du temps total
      total_timespent = formatTime(totalTimeInSeconds);
    } else {
      total_timespent = test.timespent;
    }

    const stats = {
      correctAnswers: 0,
      incorrectAnswers: 0,
      notAnswered: 0,
      results: [],
      redTagged: 0,
      greenTagged: 0,
      orangeTagged: 0,
    };

    const filterMap = {
      correct: (result) => result.isCorrect,
      incorrect: (result) => !result.isCorrect && result.userAnswer !== null,
      no_answer: (result) => result.userAnswer === null,
      red: (result) => result.isPinned.includes("red"),
      green: (result) => result.isPinned.includes("green"),
      orange: (result) => result.isPinned.includes("orange"),
      pinned: (result) =>
        result.isPinned.some((pin) => ["orange", "red", "green"].includes(pin)),
    };


    await Promise.all(test.test_sub_chapters.map(async (subChapter) => {
      await Promise.all(subChapter.user_answers.map(async (answer) => {
        const question = answer.questions;
        const isCorrect = answer.user_answer === question.answer;
        const isPinned = answer.user_answer_tags.map((tag) => tag.tags.name);

        // Mise à jour des statistiques
        if (answer.user_answer === null) {
          stats.notAnswered++;
        } else if (isCorrect) {
          stats.correctAnswers++;
        } else {
          stats.incorrectAnswers++;
        }

        // Compter les tags
        if (isPinned.includes("red")) {
          stats.redTagged++;
        }
        if (isPinned.includes("green")) {
          stats.greenTagged++;
        }
        if (isPinned.includes("orange")) {
          stats.orangeTagged++;
        }

    const question_images = getImageUrl(question.question_images, "question");

        const result = {
          questionId: question.id,
          questionText: question.question_text,
          questionImages: question_images,
          userAnswer: answer.user_answer
            ? `${answer.user_answer}: ${question.options[answer.user_answer]}`
            : null,
          isCorrect,
          isPinned,
          correctAnswer: `${question.answer}: ${
            question.options[question.answer]
          }`,
        };

        stats.results.push(result);
      }));
    }));

    const filteredResults = filter
      ? stats.results.filter(filterMap[filter])
      : stats.results;

    const totalQuestions = test.total_question || filteredResults.length;
    const score = ((stats.correctAnswers / totalQuestions) * 100).toFixed(2);
    const topic =
      test.test_sub_chapters[0]?.user_answers[0]?.questions?.sub_chapter
        ?.chapters?.topic?.topic_name || "Unknown Topic";

    if (!testfinished.is_finished) {
      await Test.update(
        {
          finished_question:
            totalQuestions - (stats.correctAnswers + stats.incorrectAnswers),
          score: parseFloat(score),
          is_finished: true,
          timespent: total_timespent,
        },
        {
          where: { id: testId, user_id: userId },
        }
      );
    }


    return res.status(200).json({
      message: "Validation completed successfully.",
      testId,
      timeSpent: total_timespent,
      dateOfValidation: new Date().toISOString(),
      totalQuestions,
      correctAnswers: stats.correctAnswers,
      incorrectAnswers: stats.incorrectAnswers,
      notAnswered: stats.notAnswered,
      scorePercentage: score,
      topic,
      details: filteredResults,
      red: stats.redTagged,
      green: stats.greenTagged,
      orange: stats.orangeTagged,
    });
  } catch (error) {
    console.error("Error during answer validation:", error);
    return res.status(500).json({
      message: "An error occurred during answer validation.",
      error: error.message,
    });
  }
};

const listUnfinishedTests = async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const unfinishedTests = await Test.findAll({
      where: {
        user_id: userId,
        timespent: { [Op.ne]: null },
      },
      include: [
        {
          model: TestSubChapter,
          as: "test_sub_chapters",
          attributes: ["sub_chapter_id"],
        },
      ],
      attributes: [
        "id",
        "createdAt",
        "timespent",
        "is_finished",
        "total_question",
        "score",
        "updatedAt",
      ],
      order: [["updatedAt", "DESC"]],
    });

    if (unfinishedTests.length === 0) {
      return res.status(200).json({
        message: "No unfinished tests found for this user.",
        unfinishedTests: [],
      });
    }

    const formattedTests = await Promise.all(
      unfinishedTests.map(async (test) => {
        let firstSubChapterId = test.test_sub_chapters[0].sub_chapter_id[0];

        if (!firstSubChapterId) {
          return null;
        }

        const subChapter = await SubChapter.findOne({
          where: {
            id: firstSubChapterId,
          },
          include: [
            {
              model: Chapter,
              as: "chapters",
              include: [
                {
                  model: Topic,
                  as: "topic",
                  attributes: ["topic_name"],
                },
              ],
            },
          ],
          attributes: ["id"],
        });

        return {
          test_id: test.id,
          topic: subChapter?.chapters?.topic?.topic_name || "Unknown",
          created_at: test.createdAt,
          timespent: test.timespent,
          is_finished: test.is_finished,
          total_question: test.total_question,
          score: test.score,
        };
      })
    );

    const filteredTests = formattedTests.filter((test) => test !== null);

    return res.status(200).json({
      message: "Unfinished tests retrieved successfully.",
      unfinishedTests: filteredTests,
    });
  } catch (error) {
    console.error("Error fetching unfinished tests:", error);
    return res.status(500).json({
      message: "An error occurred while fetching unfinished tests.",
      error: error.message,
    });
  }
};

const continueTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { testId } = req.params;
    if (!testId) {
      return res.status(400).json({
        message: "Missing required parameter: testId",
      });
    }

    const test = await Test.findByPk(testId, {
      transaction,
    });

    const timespent = test.timespent;

    const testSubChapter = await TestSubChapter.findOne({
      where: { test_id: testId },
      transaction,
    });

    const testSubChapter_id = testSubChapter ? testSubChapter.id : null;
    const savedQuestions = await UserAnswer.findAll({
      where: { testSubChapter_id: testSubChapter_id },
      include: [
        {
          model: Question, // Inclusion du modèle Question
          as: "questions",
          include: [
            {
              model: SubChapter, // Inclusion du modèle SubChapter
              as: "sub_chapter",
              attributes: ["sub_chapter_text"],
            },
            {
              model: ChatExplanation,
              as: "chatExplanations",
              attributes: ["explanation", "id"],
              required: false,
            },
          ],
        },
        {
          model: UserAnswerTag, // Inclusion du modèle UserAnswerTag
          as: "user_answer_tags",
          attributes: ["id"],
          required: false, // Facultatif
          include: [
            {
              model: Tag, // Inclusion du modèle Tag
              as: "tags",
              attributes: ["name"],
              required: false, // Facultatif
            },
          ],
        },
      ],
      transaction,
    });



    const formattedQuestions = await Promise.all(
      savedQuestions.map(async (entry) => {
        const questionData = entry.questions; // Question associée
        const userAnswerTags = entry.user_answer_tags; // Les tags associés

        // Vérifier si l'image existe dans la question
        if (questionData.question_images) {

          const imageURL_q = getImageUrl(questionData.question_images, "question");

          // Remplacer le nom de l'image par l'URL
          questionData.question_images = imageURL_q;
        }
        if (questionData.explanation_images) {

          const imageURL_ex = getImageUrl(questionData.explanation_images, "explanation");

          questionData.explanation_images = imageURL_ex;
        }

        // Extraire les noms des tags
        const tagNames =
          userAnswerTags?.map((tagEntry) => tagEntry.tags.name) || [];

        return {
          ...questionData.toJSON(), // Inclure toutes les propriétés de la question
          tags: tagNames, // Ajouter les noms des tags sous forme de tableau
          user_answer: entry.user_answer, // Réponse de l'utilisateur
          is_correct: entry.is_correct, // Statut de correction
        };
      })
    );

    await Test.update(
      {
        updatedAt: new Date(),
      },
      {
        where: { id: testId },
        transaction,
      }
    );

    await transaction.commit();
    return res.status(200).json({
      test_id: testId,
      timespent: timespent,
      total_question: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while handling the existing test.",
      error: error.message,
    });
  }
};

const resumeTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Récupérer le dernier test pour l'utilisateur avec timespent null et is_finished 0
    const latestTest = await Test.findOne({
      where: {
        user_id: userId,
        is_finished: 0,
      },
      order: [["createdAt", "DESC"]], // Trier par date de création, le plus récent en premier
      transaction,
    });

    if (!latestTest) {
      return res.status(200).json({ test: null }); // Renvoie res=null si aucun test n'est trouvé
    }

    const testId = latestTest.id; // Récupérer l'ID du dernier test
    let timespent = latestTest.timespent;

    if (!timespent) {
      const last_user_answer = await UserAnswer.findOne({
        where: {
          user_id: userId,
        },
        attributes: ["updated_at"],
        order: [["updated_at", "DESC"]],
      });

      const time_start = new Date(latestTest.updatedAt);
      const time_end = new Date(last_user_answer.updated_at);

      // Calculer la différence en millisecondes
      let formattedTime = time_end - time_start;

      // Convertir la différence en heures, minutes et secondes
      const hours = Math.floor(formattedTime / (1000 * 60 * 60));
      const minutes = Math.floor(
        (formattedTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((formattedTime % (1000 * 60)) / 1000);

      // Formater le résultat en hh:mm:ss
      timespent = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    const testSubChapter = await TestSubChapter.findOne({
      where: { test_id: testId },
      transaction,
    });

    const testSubChapter_id = testSubChapter ? testSubChapter.id : null;

    const savedQuestions = await UserAnswer.findAll({
      where: { testSubChapter_id: testSubChapter_id },
      include: [
        {
          model: Question, // Inclusion du modèle Question
          as: "questions",
          include: [
            {
              model: SubChapter, // Inclusion du modèle SubChapter
              as: "sub_chapter",
              attributes: ["sub_chapter_text"],
            },
            {
              model: ChatExplanation,
              as: "chatExplanations",
              attributes: ["explanation", "id"],
              required: false,
            },
          ],
        },
        {
          model: UserAnswerTag, // Inclusion du modèle UserAnswerTag
          as: "user_answer_tags",
          attributes: ["id"],
          required: false, // Facultatif
          include: [
            {
              model: Tag, // Inclusion du modèle Tag
              as: "tags",
              attributes: ["name"],
              required: false, // Facultatif
            },
          ],
        },
      ],
    });

    const formattedQuestions = await Promise.all(
      savedQuestions.map(async (entry) => {
        const questionData = entry.questions; // Question associée
        const userAnswerTags = entry.user_answer_tags; // Les tags associés

        // Vérifier si l'image existe dans la question
        if (questionData.question_images) {
   
          const imageURL_q = getImageUrl(questionData.question_images, "question");

          // Remplacer le nom de l'image par l'URL
          questionData.question_images = imageURL_q;
        }
        if (questionData.explanation_images) {

          const imageURL_ex = getImageUrl(questionData.explanation_images, "explanation");

          questionData.explanation_images = imageURL_ex;
        }

        // Extraire les noms des tags
        const tagNames =
          userAnswerTags?.map((tagEntry) => tagEntry.tags.name) || [];

        return {
          ...questionData.toJSON(), // Inclure toutes les propriétés de la question
          tags: tagNames, // Ajouter les noms des tags sous forme de tableau
          user_answer: entry.user_answer, // Réponse de l'utilisateur
          is_correct: entry.is_correct, // Statut de correction
        };
      })
    );

    await Test.update(
      {
        updatedAt: new Date(),
      },
      {
        where: { id: testId },
        transaction,
      }
    );

    await transaction.commit();
    return res.status(200).json({
      test_id: testId,
      timespent: timespent,
      total_question: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while handling the existing test.",
      error: error.message,
    });
  }
};

const supprimeTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { testIds } = req.body; // Attendre un tableau d'IDs de tests

    if (!Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({
        message: "Missing required parameter: testIds (must be an array)",
      });
    }

    // Vérifier si les tests existent
    const tests = await Test.findAll({
      where: { id: testIds },
      attributes: ["id", "user_id", "createdAt", "total_question"],
      raw: true,
      transaction,
    });

    if (tests.length !== testIds.length) {
      return res.status(404).json({
        message: "One or more tests not found",
      });
    }

    // Supprimer le test et ses dépendances liées
    for (const test of tests) {
      // Récupérer les autres tests à supprimer selon vos critères
      const additionalTests = await Test.findAll({
        where: {
          user_id: test.user_id,
          timespent: null,
          total_question: test.total_question,
          createdAt: {
            [Op.between]: [
              new Date(new Date(test.createdAt).getTime() - 5000), // 5 secondes avant
              new Date(new Date(test.createdAt).getTime() + 5000), // 5 secondes après
            ],
          },
        },
        attributes: ["id"],
        raw: true,
        transaction,
      });

      // Supprimer les tests supplémentaires
      const idsToDelete = additionalTests.map((t) => t.id).concat(test.id);
      await Test.destroy({
        where: { id: idsToDelete },
        transaction,
      });
    }

    await transaction.commit();
    return res.status(200).json({
      message: "Tests and related data deleted successfully",
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error deleting tests:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        message: "Cannot delete tests due to existing dependencies",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "An error occurred while deleting the tests",
      error: error.message,
    });
  }
};

const deleteTestsWithNullTimespent = async (userId) => {
  const transaction = await sequelize.transaction();
  try {
    // Si les relations sont configurées avec CASCADE DELETE,
    // une seule opération de suppression suffira
    const result = await Test.destroy({
      where: {
        timespent: null,
        user_id: userId,
      },
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error deleting tests with null timespent:", error);
    throw error;
  }
};

const countUnfinishedTest = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Récupérer le dernier test pour l'utilisateur avec timespent null et is_finished 0
    const latestTest = await Test.findAll({
      where: {
        user_id: userId,
        is_finished: 0,
      },
      transaction,
    });

    if (latestTest) {
      return res.status(200).json({ count: latestTest.length });
    } else {
      return res.status(200).json({ count: 0 });
    }
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while counting unfinished tests.",
      error: error.message,
    });
  }
};

const searchTest = async (req,res) => {
  const { keyword, country, topic_id, last_exam } = req.params;

  try {
    const questions = await getSearchQuestion(keyword, country, topic_id, last_exam );

    return res.status(200).json({
      total_question: questions.length,
      questions: questions
    });
  } catch (error) {
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while searching question",
      error: error.message,
    });
  }
};


const NewTestBySearch = async (req,res) => {
  const transaction = await sequelize.transaction();

  const { keyword, country, topic_id, last_exam } = req.body;
  const userId ='user_2sJYPzFJd929Kd2dWt8y0Rg6Oap';

  try {

    // Optimisation: Exécution parallèle des opérations indépendantes
    const questions = await getSearchQuestion(keyword, country, topic_id, last_exam );


    await UserAnswer.bulkCreate(userAnswers, { transaction });
    await transaction.commit();
    // Optimisation: Utilisation d'une seule requête avec eager loading pour récupérer les questions
    const savedUserAnswer = await UserAnswer.findAll({
      where: { testSubChapter_id: testSubChapter.id },
      attributes: [], // Exclut tous les attributs de UserAnswer
      include: [
        {
          model: Question,
          as: "questions",
          include: [
            {
              model: SubChapter,
              as: "sub_chapter",
              attributes: ["sub_chapter_text"],
            },
            {
              model: ChatExplanation,
              as: "chatExplanations",
              attributes: ["explanation", "id"],
              required: false,
            },
          ],
        },
      ],
    });



    const savedQuestions = await Promise.all(
      savedUserAnswer.map(async (userAnswer) => {
        let questionData = userAnswer.questions.toJSON();

        // Construire les URLs des images Google Drive
        questionData.question_images = getImageUrl(questionData.question_images, "question");
        questionData.explanation_images = getImageUrl(questionData.explanation_images, "explanation");

        return questionData;
      })
    );

    const topic = await Topic.findByPk(topic_id);

    return res.status(200).json({
      test_id: test.id,
      topic_name: topic.topic_name,
      total_question: savedUserAnswer.length,
      questions: savedQuestions,
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during execution:", error);
    res.status(500).json({
      message: "An error occurred while creating a new test.",
      error: error.message,
    });
  }
};

module.exports = {
  executeTest,
  saveTest,
  validateTest,
  listUnfinishedTests,
  continueTest,
  supprimeTest,
  deleteTestsWithNullTimespent,
  resumeTest,
  countUnfinishedTest,
  NewTestBySearch,
  searchTest,
};
