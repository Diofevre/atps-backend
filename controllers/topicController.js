const { Question, Topic, Chapter, SubChapter } = require("../models");
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const { deleteTestsWithNullTimespent } = require("./testController");
const { deleteExamsUnfinished } = require("../controllers/examControlleur");

// Fonction pour récupérer tous les topics
const getAllTopics = async (req, res) => {
  
  try {
    // Récupérer tous les topics
    const topics = await Topic.findAll({
      where: {
        deleted_at: null,
      },
    });

    // Vérifier si des topics ont été trouvés
    if (topics.length === 0) {
      return res.status(404).json({ message: "Aucun topic trouvé" });
    }

    // Réponse avec les topics trouvés
    return res.status(200).json({ topics });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const getChaptersAndSubChapters = async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  deleteTestsWithNullTimespent(userId);
  const { topicId } = req.params;

  // Récupérer les filtres depuis req.query
  const {
    countries,
    question_not_seen,
    green_tag,
    red_tag,
    orange_tag,
    wrong_answer,
    last_exam,
  } = req.query;

  try {
    // Vérifiez si le topic existe
    const topic = await Topic.findByPk(topicId);

    if (!topic) {
      return res.status(404).json({ message: "Topic non trouvé" });
    }

    // Construire les conditions des filtres
    const queryFilters = [];
    const queryFiltersLastExam = [];
    if (countries !== "null" && countries && countries !== "0") {
      queryFilters.push( `JSON_KEYS(q.countries) LIKE '%${filter.countries}%'`);
      
    }
    if (countries === "0") {
      queryFilters.push(`q.countries is not null`);
    }

    if (question_not_seen === "true") {
      queryFilters.push(`
                  q.id NOT IN (
                      SELECT question_id
                      FROM user_answers
                      WHERE user_id = '${userId}'
                  )
              `);
    }

    if (green_tag === "true" || red_tag === "true" || orange_tag === "true") {
      const pinnedTags = [];
      if (green_tag === "true") pinnedTags.push("green");
      if (red_tag === "true") pinnedTags.push("red");
      if (orange_tag === "true") pinnedTags.push("orange");
      queryFilters.push(
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

    if (wrong_answer === "true") {
      queryFilters.push(`
                  EXISTS (
                      SELECT 1
                      FROM user_answers AS ua
                      WHERE ua.question_id = q.id
                        AND ua.user_id = '${userId}'
                        AND (ua.is_correct = false OR ua.is_correct IS NULL)
                  )
              `);
    }

    if (last_exam && parseInt(last_exam, 10) !== 0) {
      const limit = parseInt(last_exam, 10);
      const questionlatest = await Question.findAll({
        attributes: ["id"],
        order: [["id", "DESC"]],
        where: {
          sub_chapter_id: {
            [Op.in]: sequelize.literal(`(
              SELECT id 
              FROM sub_chapters 
              WHERE chapter_id IN 
              (SELECT id FROM chapters WHERE topic_id = ${topicId}))`),
          },
        },
        limit: limit,
      });

      if (limit === 0) {
        queryFiltersLastExam.push(`
          ORDER BY q.id DESC 
        `);
      } else {
        // Extraire les IDs du résultat de la requête
        const latestIds = questionlatest.map((q) => q.id);
        queryFilters.push(`
          q.id IN (${latestIds.join(",")})
         
        `);
      }
    }
    // Sous-requête pour compter les questions filtrées
    let filteredQuestionCountQuery;
    if (queryFilters.length > 0) {
      if (countries && queryFilters.length === 1) {
        filteredQuestionCountQuery = `
        SELECT COUNT(DISTINCT q.id) 
        FROM questions AS q
        WHERE q.sub_chapter_id = subChapters.id
       AND ${queryFilters.join(" AND ")} ${
          queryFiltersLastExam.length > 0 ? ` ${queryFiltersLastExam}` : ""
        }
    `;
      } else {
        filteredQuestionCountQuery = `
        SELECT COUNT(DISTINCT q.id) 
        FROM questions AS q
        LEFT JOIN user_answers AS ua ON ua.question_id = q.id AND ua.user_id = '${userId}'
        WHERE q.sub_chapter_id = subChapters.id
        ${queryFilters.length > 0 ? `AND ${queryFilters.join(" AND ")}` : ""} ${
          queryFiltersLastExam.length > 0 ? ` ${queryFiltersLastExam}` : ""
        }
    `;
      }
    } else {
      filteredQuestionCountQuery = `
        SELECT COUNT(DISTINCT q.id) 
        FROM questions AS q
        WHERE q.sub_chapter_id = subChapters.id
    `;
    }

    // Récupérez les chapitres et leurs sous-chapitres avec le nombre de questions filtrées
    const chapters = await Chapter.findAll({
      where: { topic_id: topicId },
      include: [
        {
          model: SubChapter,
          as: "subChapters",
          attributes: {
            include: [
              [
                sequelize.literal(`(${filteredQuestionCountQuery})`),
                "questionCount",
              ],
            ],
          },
        },
      ],
    });

    // Ajoutez le nombre total de questions pour chaque chapitre
    for (let chapter of chapters) {
      let totalQuestionsInChapter = 0;

      // Calculez la somme des questions dans les sous-chapitres filtrés
      for (let subChapter of chapter.subChapters) {
        totalQuestionsInChapter += parseInt(
          subChapter.dataValues.questionCount,
          10
        );
      }

      // Ajoutez la somme des questions comme un attribut supplémentaire
      chapter.dataValues.chapterQuestionCount = totalQuestionsInChapter;
    }

    return res.status(200).json({
      topic: topic.topic_name,
      chapters,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des chapitres et sous-chapitres:",
      error
    );
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer un nouveau sujet
const createTopic = async (req, res) => {
  try {
      const { topic_name, exam_number_question, exam_duration } = req.body;
      const topic = await Topic.create({ topic_name, exam_number_question, exam_duration });
      res.status(201).json(topic);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un sujet
const updateTopic = async (req, res) => {
  try {
      const { id } = req.params;
      const { topic_name, exam_number_question, exam_duration } = req.body;
      const topic = await Topic.findByPk(id);
      if (!topic) {
          return res.status(404).json({ message: 'Sujet non trouvé' });
      }
      await topic.update({ topic_name, exam_number_question, exam_duration });
      res.status(200).json(topic);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Obtenir un sujet par son ID
const getTopicById = async (req, res) => {
  try {
      const { id } = req.params;
      const topic = await Topic.findByPk(id);
      if (!topic) {
          return res.status(404).json({ message: 'Sujet non trouvé' });
      }
      res.status(200).json(topic);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Supprimer un sujet
const deleteTopic = async (req, res) => {
  try {
      const { id } = req.params;
      const topic = await Topic.findByPk(id);
      if (!topic) {
          return res.status(404).json({ message: 'Sujet non trouvé' });
      }
      await topic.destroy();
      res.status(200).json({ message: 'Sujet supprimé avec succès' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Exporter le contrôleur
module.exports = {
  getAllTopics,
  getChaptersAndSubChapters,
  createTopic,
  updateTopic,
  getTopicById,
  deleteTopic
};
