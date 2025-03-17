const {
  User,
  Comment,
  UserAnswer,
  UserAnswerTag,
  Tag,
  TestSubChapter,
  Question,
  ExamUser,
  Exam,
  ChatExplanation,
  Topic,
  Chapter,
  SubChapter,
} = require("../models");
const { countReactions } = require("./reactionControlleur");
const sequelize = require("../config/db");
const openai = require("../config/openai");
const { getImageUrl } = require("../services/s3Service");
const { Op, Sequelize } = require("sequelize");

const getRandomQuestions = async (
  filter,
  sub_chapters,
  total_question,
  userId
) => {
  try {
    if (!Array.isArray(sub_chapters) || sub_chapters.length === 0) {
      throw new Error("sub_chapters must be a non-empty array.");
    }
    if (typeof total_question !== "number" || total_question <= 0) {
      throw new Error("total_question must be a positive number.");
    }

    // Construction des conditions WHERE
    let whereConditions = [];
    let queryFiltersLastExam = [];
    let joins = [];

    // Condition de base pour sub_chapters
    whereConditions.push(`q.sub_chapter_id IN (:sub_chapters)`);

    // Filtre des pays
    if (
      filter?.countries &&
      filter?.countries !== "0" &&
      filter?.countries !== "null"
    ) {
      whereConditions.push(
        `JSON_KEYS(q.countries) LIKE '%${filter.countries}%'`
      );
    }

    if (filter?.countries === "0") {
      whereConditions.push(`q.countries is not null`);
    }

    // Gestion des réponses non vues
    if (filter?.question_not_seen) {
      joins.push(`
        LEFT JOIN user_answers ua_seen 
        ON ua_seen.question_id = q.id 
        AND ua_seen.user_id = :userId
      `);
      whereConditions.push(`ua_seen.id IS NULL`);
    }

    // Gestion des mauvaises réponses et des tags
    const pinnedTags = [
      filter?.green_tag && "green",
      filter?.red_tag && "red",
      filter?.orange_tag && "orange",
    ].filter(Boolean);

    if (filter?.wrong_answer || pinnedTags.length > 0) {
      joins.push(`
        INNER JOIN user_answers ua 
        ON ua.question_id = q.id 
        AND ua.user_id = :userId
      `);

      if (filter?.wrong_answer) {
        whereConditions.push(`ua.is_correct = false`);
      }

      if (pinnedTags.length > 0) {
        whereConditions.push(
          `ua.user_id = '${userId}' AND ua.id IN (
          SELECT user_answer_id 
          FROM user_answer_tags 
          WHERE tag_id IN (
            SELECT id 
            FROM tags 
            WHERE name IN (${pinnedTags.map((tag) => `'${tag}'`).join(",")})
          )
        )`
        );
      }
    }

    // Filtrage par date de dernier examen (last_exam)
    if (filter?.last_exam && filter.last_exam !== "null") {
      queryFiltersLastExam.push(`
        WITH ExtractedDates AS (
          SELECT 
            q.id,
            q.question_text,
            q.answer,
            q.options,
            q.explanation,
            q.sub_chapter_id,
            q.countries,
            MAX(
              STR_TO_DATE(
                JSON_UNQUOTE(dates.date_string), 
                '%M, %d (%c)'
              )
            ) AS recent_exam_date
          FROM questions q 
          JOIN JSON_TABLE(
            JSON_EXTRACT(q.countries, '$.*.*'), 
            '$[*]' COLUMNS(date_string VARCHAR(50) PATH '$')
          ) AS dates
            ${joins.join(" ")}
          ${
            whereConditions.length > 0
              ? `WHERE ${whereConditions.join(" AND ")}`
              : ""
          }
          GROUP BY q.id
        ),
        FilteredQuestions AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY recent_exam_date DESC) AS rn
          FROM ExtractedDates
          
        )
        SELECT * 
        FROM FilteredQuestions
        WHERE rn <= :total_question;
      `);
    } else {
      queryFiltersLastExam.push(`
        WITH FilteredQuestions AS (
          SELECT q.*, ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
          FROM questions q
          ${joins.join(" ")}
          ${
            whereConditions.length > 0
              ? `WHERE ${whereConditions.join(" AND ")}`
              : ""
          }
        )
        SELECT * 
        FROM FilteredQuestions
        WHERE rn <= :total_question;
      `);
    }

    // Construction de la requête finale en fonction de last_exam
    const query = queryFiltersLastExam.join(" ");

    // Exécution de la requête
    const questions = await sequelize.query(query, {
      replacements: {
        userId,
        sub_chapters,
        total_question,
      },
      type: sequelize.QueryTypes.SELECT,
      model: Question,
      mapToModel: true,
    });

    if (questions.length === 0) {
      throw new Error("No questions found for the specified criteria.");
    }

    // Ajout des commentaires avec réactions pour chaque question
    const questionsWithComments = await Promise.all(
      questions.map(async (question) => {
        const comments = await Comment.findAll({
          where: { question_id: question.id },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["username"],
            },
          ],
          attributes: ["id", "content", "created_at"],
        });

        // Ajout des réactions (likes/dislikes) à chaque commentaire
        const commentsWithReactions = await Promise.all(
          comments.map(async (comment) => {
            const likes = await countReactions(comment.id, "like");
            const dislikes = await countReactions(comment.id, "dislike");

            return {
              ...comment.toJSON(),
              likes,
              dislikes,
            };
          })
        );

        return {
          ...question.toJSON(),
          comments: commentsWithReactions,
        };
      })
    );

    return questionsWithComments;
  } catch (error) {
    console.error("Error in getRandomQuestions:", error);
    throw new Error(`Failed to retrieve questions: ${error.message}`);
  }
};

const getSearchQuestion = async (keyword, countries, topic_id, last_exam) => {
  try {
    // Construction des conditions WHERE
    let whereConditions = [];

    if (keyword && keyword !== "null") {
      const parsedKeyword = parseInt(keyword, 10);

      if (isNaN(parsedKeyword)) {
        whereConditions.push(
          `FilteredQuestions.question_text LIKE '%${keyword}%'`
        );
      } else {
        whereConditions.push(`FilteredQuestions.id = ${parsedKeyword}`);
      } 
    }

    if (topic_id && topic_id !== "null") {
      whereConditions.push(`
        FilteredQuestions.sub_chapter_id IN (
          SELECT id FROM sub_chapters 
          WHERE chapter_id IN (
            SELECT id FROM chapters WHERE topic_id = ${topic_id}
          )
        )
      `);
    }

    // Filtre des pays
    if (countries && countries !== "0" && countries !== "null") {
      whereConditions.push(
        `JSON_KEYS(FilteredQuestions.countries) LIKE '%${countries}%'`
      );
    }

    if (countries === "0" || countries === "null") {
      whereConditions.push(`FilteredQuestions.countries IS NOT NULL`);
    }

    // Construction de la requête SQL
    let query;
    if (last_exam && last_exam !== "null") {
      query = `
        WITH ExtractedDates AS (
          SELECT 
            q.id,
            q.question_text,
            q.answer,
            q.options,
            q.explanation,
            q.sub_chapter_id,
            q.countries,
            MAX(
              STR_TO_DATE(
                JSON_UNQUOTE(dates.date_string), 
                '%M, %d (%c)'
              )
            ) AS recent_exam_date
          FROM questions q
          JOIN JSON_TABLE(
            JSON_EXTRACT(q.countries, '$.*.*'), 
            '$[*]' COLUMNS(date_string VARCHAR(50) PATH '$')
          ) AS dates
          GROUP BY q.id
        ),
        FilteredQuestions AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY recent_exam_date DESC) AS rn
          FROM ExtractedDates
        )
        SELECT * FROM FilteredQuestions
        ${
          whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : ""
        };
      `;
    } else {
      query = `
        WITH FilteredQuestions AS (
          SELECT q.*, ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
          FROM questions q
        )
        SELECT * FROM FilteredQuestions
        ${
          whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : ""
        };
      `;
    }

    console.log(query);
    // Exécution de la requête
    const questions = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      model: Question,
      mapToModel: true,
    });

    if (questions.length === 0) {
      throw new Error("No questions found for the specified criteria.");
    }

    // Ajout des commentaires avec réactions pour chaque question
    const questionsWithComments = await Promise.all(
      questions.map(async (question) => {
        const comments = await Comment.findAll({
          where: { question_id: question.id },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["username"],
            },
          ],
          attributes: ["id", "content", "created_at"],
        });

        // Ajout des réactions (likes/dislikes) à chaque commentaire
        const commentsWithReactions = await Promise.all(
          comments.map(async (comment) => {
            const likes = await countReactions(comment.id, "like");
            const dislikes = await countReactions(comment.id, "dislike");

            return {
              ...comment.toJSON(),
              likes,
              dislikes,
            };
          })
        );

        return {
          ...question.toJSON(),
          comments: commentsWithReactions,
        };
      })
    );

    return questionsWithComments;
  } catch (error) {
    console.error("Error in getSearchQuestion:", error);
    throw new Error(`Failed to retrieve questions: ${error.message}`);
  }
};

const isPinned = async (req, res) => {
  const transaction = await sequelize.transaction();
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const { testId, question_id, is_pinned } = req.body;

    if (!testId || !question_id) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Missing required fields. Please provide testId and question_id.",
      });
    }

    const testSubChapter = await TestSubChapter.findOne({
      where: { test_id: testId },
      transaction,
    });

    if (!testSubChapter) {
      await transaction.rollback();
      return res.status(400).json({
        message: "TestSubChapter not found.",
      });
    }

    const testSubChapterId = testSubChapter.id;

    const userAnswer = await UserAnswer.findOne({
      where: {
        user_id: userId,
        question_id,
        testSubChapter_id: testSubChapterId,
      },
      transaction,
    });

    if (!userAnswer) {
      await transaction.rollback();
      return res.status(400).json({
        message: "User answer not found.",
      });
    }

    if (userAnswer.is_pinned === is_pinned) {
      userAnswer.is_pinned = null;
    } else {
      userAnswer.is_pinned = is_pinned;
    }

    await userAnswer.save({ transaction });
    await transaction.commit();
    return res.status(200).json({ message: "Pinnage de la question réussi." });
  } catch (err) {
    console.error("Error during execution:", err);
    await transaction.rollback();
    return res.status(500).json({ message: "Failed to execute query." });
  }
};

const isAnswerCorrect = async (req, res) => {
  const transaction = await sequelize.transaction();
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  try {
    const {
      testId = null,
      question_id,
      user_answer,
      exam_id = null,
    } = req.body;

    // Vérifier que tous les paramètres sont présents
    if (!question_id || !userId || !user_answer) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Missing required fields. Please provide question_id, user_answer, and user_id.",
      });
    }

    const question = await Question.findOne({
      where: { id: question_id },
      attributes: ["answer"],
      transaction,
    });

    if (!question) {
      await transaction.rollback();
      return res.status(404).json({
        message: `Question with id ${question_id} does not exist.`,
      });
    }

    const is_correct = question.answer === user_answer;

    if (testId) {
      const testSubChapter = await TestSubChapter.findOne(
        {
          where: { test_id: testId },
          attributes: ["id"],
        },
        transaction
      );
      const testSubChapterId = testSubChapter.id;

      // Récupérer la question et la réponse existante en une seule transaction
      const existingAnswer = await UserAnswer.findOne({
        where: {
          testSubChapter_id: testSubChapterId,
          user_id: userId,
          question_id: question_id,
          user_answer: null,
          is_correct: null,
        },
        attributes: ["id"],
        transaction,
      });

      if (existingAnswer) {
        await UserAnswer.update(
          {
            user_answer: user_answer,
            is_correct: is_correct,
          },
          {
            where: {
              testSubChapter_id: testSubChapterId,
              user_id: userId,
              question_id: question_id,
            },
            transaction,
          }
        );
      } else if (!is_correct) {
        // Mettre à jour si la réponse précédente est incorrecte
        await UserAnswer.update(
          {
            user_answer: user_answer,
            is_correct: is_correct,
          },
          {
            where: {
              testSubChapter_id: testSubChapterId,
              user_id: userId,
              question_id: question_id,
            },
            transaction,
          }
        );
      }
    } else if (exam_id) {
      // Récupérer la question et la réponse existante en une seule transaction
      const existingAnswer = await ExamUser.findOne({
        where: {
          exam_id: exam_id,
          question_id: question_id,
          user_answer: null,
          is_correct: null,
        },
        attributes: ["id"],
        transaction,
      });

      if (existingAnswer) {
        await ExamUser.update(
          {
            user_answer: user_answer,
            is_correct: is_correct,
          },
          {
            where: {
              question_id: question_id,
              exam_id: exam_id,
            },
            transaction,
          }
        );
      } else if (!is_correct) {
        // Mettre à jour si la réponse précédente est incorrecte
        await ExamUser.update(
          {
            user_answer: user_answer,
            is_correct: is_correct,
          },
          {
            where: {
              question_id: question_id,
              exam_id: exam_id,
            },
            transaction,
          }
        );
      }
    }

    await transaction.commit();

    // Retourner la réponse avec le statut correct
    return res.status(200).json({
      message: "Answer validated successfully.",
      is_correct: is_correct,
      correct_answer: question.answer,
    });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("Error during answer validation:", error);
    return res.status(500).json({
      message: "An error occurred while validating the answer.",
      error: error.message,
    });
  }
};

const updateTags = async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const { testId, question_id, is_pinned } = req.body;
  const tag = is_pinned;

  if (!testId || !question_id || !tag) {
    return res.status(400).json({
      message:
        "Missing required fields. Please provide testId, question_id, and a tag.",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const testSubChapter = await TestSubChapter.findOne({
      where: { test_id: testId },
      transaction,
    });

    if (!testSubChapter) {
      await transaction.rollback();
      return res.status(400).json({ message: "TestSubChapter not found." });
    }

    const userAnswer = await UserAnswer.findOne({
      where: {
        user_id: userId,
        question_id,
        testSubChapter_id: testSubChapter.id,
      },
      transaction,
    });

    if (!userAnswer) {
      await transaction.rollback();
      return res.status(400).json({ message: "User answer not found." });
    }

    // Récupérer les tags associés à cette réponse
    const existingTags = await UserAnswerTag.findAll({
      where: { user_answer_id: userAnswer.id },
      include: [{ model: Tag, as: "tags" }],
      transaction,
    });

    const existingTag = existingTags.find(
      (existingTag) => existingTag.tags.name === tag
    );

    if (existingTag) {
      // Supprimer le tag existant
      await UserAnswerTag.destroy({
        where: { user_answer_id: userAnswer.id, id: existingTag.id },
        transaction,
      });
    } else {
      // Créer ou récupérer le tag
      const [tagInstance] = await Tag.findOrCreate({
        where: { name: tag },
        defaults: { name: tag },
        transaction,
      });

      // Associer le tag au UserAnswer
      await UserAnswerTag.create(
        {
          user_answer_id: userAnswer.id,
          tag_id: tagInstance.id,
        },
        { transaction }
      );
    }

    await transaction.commit();
    return res.status(200).json({ message: "Tag updated successfully." });
  } catch (err) {
    console.error("Error during execution:", err);
    await transaction.rollback();
    return res.status(500).json({ message: "Failed to update tag." });
  }
};

//utilisé dans la page validate answer
const getQuestionById = async (req, res) => {
  const { question_id, test_id = null, exam_id = null } = req.params;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    let question = null;
    let user_answer, is_correct;
    if (test_id && parseInt(test_id) !== 0) {
      const testSubChapter = await TestSubChapter.findOne({
        where: { test_id: test_id },
        attributes: ["id"],
      });

      const testSubChapterId = testSubChapter ? testSubChapter.id : null;

      question = await Question.findOne({
        where: { id: question_id },
        include: [
          {
            model: UserAnswer,
            as: "user_answers",
            where: { user_id: userId, testSubChapter_id: testSubChapterId },
            attributes: ["user_answer", "is_correct"],
          },
          {
            model: Comment,
            as: "comments",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["username"],
              },
            ],
            attributes: ["id", "content", "created_at"],
          },
        ],
      });

      user_answer =
        question.user_answers.length > 0
          ? question.user_answers[0].user_answer
          : null;
      is_correct =
        question.user_answers.length > 0
          ? question.user_answers[0].is_correct
          : null;
    } else if (exam_id && parseInt(exam_id) !== 0) {
      question = await Question.findOne({
        where: { id: question_id },
        include: [
          {
            model: ExamUser,
            as: "exam_users",
            where: { exam_id: exam_id },
            attributes: ["user_answer", "is_correct"],
          },
          {
            model: Comment,
            as: "comments",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["username"],
              },
            ],
            attributes: ["id", "content", "created_at"],
          },
        ],
      });

      user_answer =
        question.exam_users.length > 0
          ? question.exam_users[0].user_answer
          : null;
      is_correct =
        question.exam_users.length > 0
          ? question.exam_users[0].is_correct
          : null;
    }

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    const commentsWithReactions = await Promise.all(
      question.comments.map(async (comment) => {
        const likes = await countReactions(comment.id, "like");
        const dislikes = await countReactions(comment.id, "dislike");

        return {
          ...comment.toJSON(),
          likes,
          dislikes,
        };
      })
    );

    const response = {
      question_text: question.question_text,
      answer: question.answer,
      options: question.options,
      explanation: question.explanation,
      countries: question.countries,
      user_answer,
      is_correct,
      comments: commentsWithReactions,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving question:", error);
    res.status(500).json({
      message: "An error occurred while retrieving the question.",
      error: error.message,
    });
  }
};

const ameliorateQuestion = async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const { question_id } = req.body;
  if (!question_id) {
    return res.status(400).json({ error: "Question ID is required" });
  }

  try {
    // Récupérer la question complète avec ses détails
    const question = await Question.findByPk(question_id, {
      attributes: ["question_text", "explanation", "options", "answer"],
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Préparer le contexte complet
    const questionContext = {
      question: question.question_text,
      explanation: question.explanation,
      options: question.options,
      correctAnswer: question.answer,
    };

    const systemMessage = `You are an advanced aviation expert assistant specializing in paraphrasing and enriching technical explanations.

    CONTEXT: Here is the original aviation question and explanation:
    
    QUESTION: ${questionContext.question}
    
    ORIGINAL EXPLANATION: ${questionContext.explanation}
    
    
    
    YOUR TASK:
    1. Paraphrase the original explanation by:
       - Reformulating the key concepts in different words
       - Maintaining technical accuracy while varying the vocabulary
       - Breaking down complex ideas into clearer terms
       
    2. Enrich the explanation by adding:
       - Additional technical details directly related to the topic
       - Relevant aviation principles and regulations
       - Practical examples or real-world scenarios
       - Safety considerations if applicable
       - Links to related aviation concepts
       
    Do not give title of the explanation
    
    Use professional aviation terminology while ensuring the explanation remains accessible.
    Use short explanation but relevant
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
      ],
      temperature: 0.7,
    });

    const improvedExplanation = completion.choices[0].message.content;

    // Sauvegarder l'amélioration dans la base de données

    const newExplanation = await ChatExplanation.create({
      question_id: question_id,
      user_id: userId,
      explanation: improvedExplanation,
    });

    const id = newExplanation.id;

    return res.status(200).json({
      id: id,
      chat_explanation: improvedExplanation,
      date: new Date(),
    });
  } catch (error) {
    console.error("Error improving question:", error);
    return res.status(500).json({
      error: "An error occurred while improving the explanation",
      details: error.message,
    });
  }
};

const deleteChatExplanation = async (req, res) => {
  try {
    // Extraire l'ID depuis les paramètres
    const { chat_explanation_id } = req.params;

    // Vérifier si l'ID est fourni
    if (!chat_explanation_id) {
      return res.status(400).json({ error: "Chat explanation ID is required" });
    }

    // Supprimer l'explication associée
    const deletedCount = await ChatExplanation.destroy({
      where: { id: chat_explanation_id },
    });

    // Vérifier si un enregistrement a été supprimé
    if (deletedCount === 0) {
      return res.status(404).json({ error: "Chat explanation not found" });
    }

    // Répondre avec un succès
    return res.status(200).json({
      message: "Chat explanation deleted successfully",
      deletedId: chat_explanation_id,
    });
  } catch (error) {
    console.error("Error deleting chat explanation:", error);

    // Répondre avec une erreur serveur en cas de problème
    return res.status(500).json({
      error: "An error occurred while deleting the chat explanation",
      details: error.message,
    });
  }
};

// Fonction pour obtenir toutes les questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll();
    return res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const getQuestionDetailById = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await Question.findOne({
      where: { id },
      include: [
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["username"],
            },
          ],
          attributes: ["id", "content", "created_at"],
        },
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
    });

    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }

    const googleDrivePreviewURL = "https://drive.google.com/thumbnail?id=";
    const id_folder_q = "1NXJaopSiBJodatMN4tlk-LNVjdYXThj3";
    const id_folder_ex = "1duxyi_NDEQ0xkdx3c1hX46659pwTuxEr";

    // Manipuler directement la question sans utiliser map
    const questionData = question.toJSON(); // Convertir en JSON

    // Vérifier si l'image existe dans la question
    if (questionData.question_images) {
      const image_url_q = getImageUrl(questionData.question_image, "question");

      // Remplacer le nom de l'image par l'URL
      questionData.question_images = image_url_q;
    }

    if (questionData.explanation_images) {
      const image_url_ex = getImageUrl(
        questionData.explanation_images,
        "explanation"
      );

      questionData.explanation_images = image_url_ex;
    }

    // Ajouter les likes/dislikes aux commentaires
    const commentsWithReactions = await Promise.all(
      question.comments.map(async (comment) => {
        const likes = await countReactions(comment.id, "like");
        const dislikes = await countReactions(comment.id, "dislike");

        return {
          ...comment.toJSON(),
          likes,
          dislikes,
        };
      })
    );

    // Construire la réponse finale
    const response = {
      question: questionData,
      comments: commentsWithReactions,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération de la question:", error);
    return res.status(500).json({
      message:
        "Une erreur s'est produite lors de la récupération de la question.",
      error: error.message,
    });
  }
};

// Fonction pour créer une nouvelle question
const createQuestion = async (req, res) => {
  const {
    question_text,
    answer,
    options,
    explanation,
    countries,
    explanation_images,
    question_images,
    quality_score,
    sub_chapter_id,
  } = req.body;

  try {
    const newQuestion = await Question.create({
      question_text,
      answer,
      options,
      explanation,
      countries,
      explanation_images,
      question_images,
      quality_score,
      sub_chapter_id,
    });
    return res.status(201).json(newQuestion);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const createTopicWithChapterSubChapterAndQuestions = async (req, res) => {
  const {
    topic_name,
    exam_number_question,
    exam_duration,
    chapter_text,
    sub_chapter_text,
    questions, // Array of questions
  } = req.body;

  try {
    // Créer le Topic
    const topic = await Topic.create({
      topic_name,
      exam_number_question,
      exam_duration,
    });

    // Créer le Chapter
    const chapter = await Chapter.create({
      chapter_text,
      topic_id: topic.id, // Utilisation de l'ID du topic créé
    });

    // Créer le SubChapter
    const subChapter = await SubChapter.create({
      sub_chapter_text,
      chapter_id: chapter.id, // Utilisation de l'ID du chapter créé
    });

    // Créer les questions (array de questions)
    const questionsData = questions.map((question) => ({
      question_text: question.question_text,
      answer: question.answer,
      options: question.options,
      explanation: question.explanation,
      countries: question.countries,
      explanation_images: question.explanation_images,
      question_images: question.question_images,
      quality_score: question.quality_score,
      sub_chapter_id: subChapter.id, // Utilisation de l'ID du subchapter créé
    }));

    // Créer toutes les questions en même temps
    const createdQuestions = await Question.bulkCreate(questionsData);

    return res.status(201).json({
      message: "Topic, Chapter, SubChapter, and Questions created successfully",
      data: {
        topic,
        chapter,
        subChapter,
        questions: createdQuestions,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

// Fonction pour mettre à jour une question existante
const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const {
    question_text,
    answer,
    options,
    explanation,
    countries,
    explanation_images,
    question_images,
    quality_score,
    sub_chapter_id,
  } = req.body;

  try {
    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }

    // Mise à jour de la question
    question.question_text = question_text || question.question_text;
    question.answer = answer || question.answer;
    question.options = options || question.options;
    question.explanation = explanation || question.explanation;
    question.countries = countries || question.countries;
    question.explanation_images =
      explanation_images || question.explanation_images;
    question.question_images = question_images || question.question_images;
    question.quality_score = quality_score || question.quality_score;
    question.sub_chapter_id = sub_chapter_id || question.sub_chapter_id;

    await question.save();

    return res.status(200).json(question);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Fonction pour supprimer une question
const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }

    await question.destroy();
    return res.status(200).json({ message: "Question supprimée avec succès" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

/**
 * Récupérer les questions par sous-chapitre
 */
const getQuestionsBySubChapter = async (req, res) => {
  try {
    const { sub_chapter_id } = req.params;

    if (!sub_chapter_id) {
      return res
        .status(400)
        .json({ message: "L'ID du sous-chapitre est requis." });
    }

    const questions = await Question.findAll({ where: { sub_chapter_id } });

    return res.status(200).json(questions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

/**
 * Récupérer les questions par chapitre
 */
const getQuestionsByChapter = async (req, res) => {
  try {
    const { chapter_id } = req.params;

    if (!chapter_id) {
      return res.status(400).json({ message: "L'ID du chapitre est requis." });
    }

    const questions = await Question.findAll({
      include: {
        model: SubChapter,
        where: { chapter_id },
        attributes: [],
      },
    });

    return res.status(200).json(questions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

/**
 * Récupérer les questions par topic
 */
const getQuestionsByTopic = async (req, res) => {
  try {
    const { topic_id } = req.params;

    if (!topic_id) {
      return res.status(400).json({ message: "L'ID du topic est requis." });
    }

    const questions = await Question.findAll({
      include: {
        model: SubChapter,
        include: {
          model: Chapter,
          where: { topic_id },
          attributes: [],
        },
        attributes: [],
      },
    });

    return res.status(200).json(questions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

module.exports = {
  getRandomQuestions,
  isAnswerCorrect,
  isPinned,
  updateTags,
  getQuestionById,
  ameliorateQuestion,
  deleteChatExplanation,
  getSearchQuestion,
  getAllQuestions,
  getQuestionDetailById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createTopicWithChapterSubChapterAndQuestions,
  getQuestionsBySubChapter,
  getQuestionsByChapter,
  getQuestionsByTopic,
};
