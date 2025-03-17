const {
  Question,
  Topic,
  Bookmark,
  User,
  UserAnswer,
  Chapter,
  SubChapter,
  Exam,
  Test,
  TestSubChapter,
} = require("../models");
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const { google } = require("googleapis");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");
const Parser = require("rss-parser");
const parser = new Parser();
const cheerio = require("cheerio");
const axios = require("axios");
const openai = require("../config/openai");

// Charger les flux RSS depuis les variables d'environnement
const rssFeeds = process.env.RSS_FEEDS ? process.env.RSS_FEEDS.split(",") : [];
const NodeCache = require("node-cache");
const newsCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Expire après 1 heure, vérification toutes les 10 min

const refreshNewsCache = async () => {
  console.log("🔄 Rafraîchissement des news en arrière-plan...");
  newsCache.del("latestNews");
  newsCache.del("lastFourNews");

  try {
    let allArticles = [];
    let lastFourArticles = [];
    const now = new Date(); // Date actuelle
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 heures en arrière

    const feedPromises = rssFeeds.map(async (url) => {
      try {
        const feed = await parser.parseURL(url.trim());
        if (!feed.items.length) return;

        // Filtrer les articles publiés dans les dernières 24h
        const recentArticles = feed.items
          .filter(item => new Date(item.pubDate) > oneDayAgo)
          .slice(0, 5); // Prendre au max les 5 derniers articles récents

        if (!recentArticles.length) return; // Si aucun article récent, passer au prochain flux

        // Reformuler le contenu en parallèle
        const summaryContent = await rephraseContent(recentArticles[0]["content:encoded"] || recentArticles[0].content || recentArticles[0].description || "Pas de contenu disponible");
        const reformulatedContents = await Promise.all(
          recentArticles.map((item) =>
            rephraseFullContent(item["content:encoded"] || item.content || item.description || "Pas de contenu disponible")
          )
        );

        // Construire les objets articles
        const formattedArticles = await Promise.all(
          recentArticles.map(async (item, index) => ({
            title: item.title,
            link: item.link,
            pubDate: new Date(item.pubDate),
            image: await extractImageFromItem(item),
            content: reformulatedContents[index],
          }))
        );

        // Ajouter l'article le plus récent (le premier de la liste)
        allArticles.push({ success: true, ...formattedArticles[0], content: summaryContent });

        // Ajouter les 4 autres articles (incluant le plus récent)
        lastFourArticles.push(...formattedArticles);
      } catch (err) {
        console.error(`⚠️ Erreur RSS (${url}):`, err);
      }
    });

    await Promise.all(feedPromises); // Attendre que tous les flux soient traités

    if (allArticles.length) {
      newsCache.set("latestNews", allArticles);
      console.log("✅ Article le plus récent mis à jour dans le cache !");
    }

    if (lastFourArticles.length) {
      newsCache.set("lastFourNews", lastFourArticles);
      console.log("✅ Les 4 derniers articles mis à jour dans le cache !");
    }
  } catch (error) {
    console.error("⚠️ Erreur lors de la mise à jour du cache RSS:", error);
  }
};

// Lancer le rafraîchissement toutes les 1 heure
setInterval(refreshNewsCache, 60 * 60 * 1000); // 1 heure = 60 min * 60 sec * 1000 ms


refreshNewsCache();

const getLatestRSSArticle = async () => {
  try {
    const cachedNews = newsCache.get("latestNews");
    if (!cachedNews || cachedNews.length === 0) {
      return { success: false, message: "Aucun article en cache. Attendez quelques instants..." };
    }

    const latestArticle = cachedNews[0];
    return {
      article: latestArticle,
    };

  } catch (error) {
    console.error("Erreur lors de la récupération des news en cache:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des news.",
    });
  }
};

/*
const getLatestRSSArticle = async () => {
  try {
    if (rssFeeds.length === 0) {
      return { success: false, message: "Aucun flux RSS configuré." };
    }

    let latestArticle = null;
    
    // Traiter tous les flux en parallèle plutôt qu'en lots
    // car nous ne prenons qu'un seul article par flux
    const results = await Promise.all(
      rssFeeds.map(async (url) => {
        try {
          const feed = await parser.parseURL(url.trim());
          if (!feed?.items?.length) return null;

          // Prendre le premier article seulement
          const mostRecentItem = feed.items[0];
          
          // Extraire l'image et le contenu en parallèle
          const [imageUrl, originalContent] = await Promise.all([
            extractImageFromItem(mostRecentItem),
            Promise.resolve(
              mostRecentItem["content:encoded"] ||
              mostRecentItem.content ||
              mostRecentItem.description ||
              "Pas de contenu disponible"
            )
          ]);

          const reformulatedContent = await rephraseContent(originalContent);

          return {
            title: mostRecentItem.title,
            link: mostRecentItem.link,
            pubDate: new Date(mostRecentItem.pubDate),
            image: imageUrl,
            content: reformulatedContent,
          };
        } catch (err) {
          console.error(`Erreur RSS (${url}):`, err);
          return null;
        }
      })
    );

    // Trouver l'article le plus récent
    latestArticle = results.reduce((latest, current) => {
      if (!current) return latest;
      if (!latest || current.pubDate > latest.pubDate) return current;
      return latest;
    }, null);

    if (!latestArticle) {
      return { success: false, message: "Aucun article trouvé" };
    }

    return { success: true, article: latestArticle };
  } catch (error) {
    console.error("Erreur récupération RSS:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des articles RSS",
      error: error.message,
    };
  }
};
*/
// Cache decorator pour rephraseContent
const createCache = (fn, maxSize = 100) => {
  const cache = new Map();
  
  return async (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = await fn(...args);
    
    if (cache.size >= maxSize) {
      cache.delete(cache.keys().next().value);
    }
    
    cache.set(key, result);
    return result;
  };
};

// Version simplifiée et optimisée de rephraseContent
const rephraseContent = createCache(async (originalContent) => {
  try {
    const systemMessage = `You are an advanced AI specializing in concise and natural content reformulation.

    CONTEXT:
    - Below is an article excerpt:

    ORIGINAL CONTENT:
    "${originalContent}"

    YOUR TASK:
    - Summarize and reformulate the content while preserving its meaning.
    - Use varied vocabulary and sentence structures.
    - Ensure clarity, fluidity, and conciseness.
    - Remove unnecessary details while keeping the essential message.
      
    Output only the reformulated content, without additional comments.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemMessage }],
      temperature: 0.7,
    });
    const response = completion.choices?.[0]?.message?.content || originalContent;

    return response;
  } catch (error) {
    console.error("Erreur reformulation:", error);
    return originalContent;
  }
});

// Fonction pour récupérer les informations du Dashboard
const getDashboardInfo = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    // Récupération des données en parallèle
    const [
      latestRSS,
      totalQuestions,
      seenQuestions,
      correctAnswerQuestions,
      incorrectAnswerQuestions,
      seenExam,
      seenTest,
      finishedTest,
      unfinishedTest,
      user,
      topics
    ] = await Promise.all([
      getLatestRSSArticle(), // Récupération de l'article RSS
      Question.count(), // Total des questions
      Question.count({
        include: [{
          model: UserAnswer,
          as: "user_answers",
          where: { user_id: userId },
        }],
      }), // Nombre de questions vues
      Question.count({
        include: [{
          model: UserAnswer,
          as: "user_answers",
          where: { user_id: userId, is_correct: true },
        }],
      }), // Nombre de réponses correctes
      Question.count({
        include: [{
          model: UserAnswer,
          as: "user_answers",
          where: { user_id: userId, is_correct: false },
        }],
      }), // Nombre de réponses incorrectes
      Exam.count({ where: { user_id: userId } }), // Nombre d'examens vus
      Test.count({ where: { user_id: userId } }), // Nombre de tests vus
      Test.count({ where: { user_id: userId, is_finished: true } }), // Tests terminés
      Test.count({ where: { user_id: userId, is_finished: false } }), // Tests non terminés
      User.findOne({
        where: { clerkId: userId },
        attributes: ["name", "username"], // Limite les colonnes récupérées
      }), // Infos utilisateur
      Topic.findAll({
        attributes: ["id", "topic_name"],
        include: [{
          model: Chapter,
          as: "chapters",
          attributes: ["id"],
          include: [{
            model: SubChapter,
            as: "subChapters",
            attributes: ["id"],
          }],
        }],
      }), // Récupération des topics
    ]);

    // Vérifier si l'article RSS est bien récupéré
    if (!latestRSS.article.success) {
      return res.status(400).json({ success: false, message: "Aucun article " });
    }

    // Calculer le score général
    const generalScore = totalQuestions
      ? parseFloat(((correctAnswerQuestions / totalQuestions) * 100).toFixed(2))
      : 0;

    // Calculer les scores par matière en parallèle
    const topicScores = await Promise.all(
      topics.map(async (topic) => {
        const topicSubChapterIds = topic.chapters.flatMap((chapter) =>
          chapter.subChapters.map((sc) => sc.id)
        );

        const [totalTopicQuestions, correctTopicAnswers] = await Promise.all([
          Question.count({ where: { sub_chapter_id: topicSubChapterIds } }),
          UserAnswer.count({
            where: { user_id: userId, is_correct: true },
            include: [{
              model: Question,
              as: "questions",
              where: { sub_chapter_id: topicSubChapterIds },
            }],
          }),
        ]);

        return {
          topic_id: topic.id,
          topic_name: topic.topic_name,
          score: totalTopicQuestions
            ? parseFloat(((correctTopicAnswers / totalTopicQuestions) * 100).toFixed(2))
            : 0,
        };
      })
    );

    // Réponse optimisée
    return res.status(200).json({
      user,
      statistics: {
        questions: {
          total: totalQuestions,
          seen: seenQuestions,
          correct: correctAnswerQuestions,
          incorrect: incorrectAnswerQuestions,
          generalScore,
        },
        exams: { seen: seenExam },
        tests: {
          seen: seenTest,
          finished: finishedTest,
          unfinished: unfinishedTest,
        },
      },
      topics: topicScores,
      latestArticle: latestRSS.article,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données du dashboard :", error);
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

const getAdminDashboardInfo = async (req, res) => {
  try {
    // 🔹 Nombre total de tests et examens réalisés
    const totalTests = await Test.count();
    const totalExams = await Exam.count();

    // 🔹 Nombre total d'utilisateurs
    const totalUsers = await User.count();

    // 🔹 Nombre de users ayant fait au moins un test ou un exam
    const usersWithTests = await Test.count({ distinct: true, col: "user_id" });
    const usersWithExams = await Exam.count({ distinct: true, col: "user_id" });

    // 🔹 Nombre total de tests et exams réalisés par topic
    const topics = await Topic.findAll({
      attributes: ["id", "topic_name"],
      include: [
        {
          model: Chapter,
          as: "chapters",
          attributes: ["id"],
          include: [
            {
              model: SubChapter,
              as: "subChapters",
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    // Calculer les tests et examens par sujet
    const topicStats = await Promise.all(
      topics.map(async (topic) => {
        const topicSubChapterIds = topic.chapters.flatMap((chapter) =>
          chapter.subChapters.map((sc) => sc.id)
        );

        // 🔹 Nombre total de tests pour le sujet
        const totalTestsForTopic = await Test.count({
          include: [
            {
              model: TestSubChapter,
              as: "test_sub_chapters",
              where: { sub_chapter_id: topicSubChapterIds },
            },
          ],
        });

        // 🔹 Nombre total d'examens pour le sujet
        const totalExamsForTopic = await Exam.count({
          where: {
            topic_id: topic.id,
          },
        });

        return {
          topic_id: topic.id,
          topic_name: topic.topic_name,
          total_tests: totalTestsForTopic,
          total_exams: totalExamsForTopic,
        };
      })
    );

    // 🔹 Meilleurs scores des utilisateurs
    const topUsers = await UserAnswer.findAll({
      attributes: [
        "user_id",
        [sequelize.fn("AVG", sequelize.col("is_correct")), "average_score"],
      ],
      group: ["user_id"],
      order: [[sequelize.literal("average_score"), "DESC"]],
      limit: 5,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "username"] },
      ],
    });

    // 🔹 Activité récente (derniers tests/exams faits)
    const recentTests = await Test.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["id", "name", "username"] },
      ],
    });

    const recentExams = await Exam.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["id", "name", "username"] },
        { model: Topic, as: "topic", attributes: ["id", "topic_name"] },
      ],
    });

    // 🔹 Retour des données pour le front
    return res.status(200).json({
      statistics: {
        totalTests,
        totalExams,
        totalUsers,
        usersWithTests,
        usersWithExams,
      },
      topics: topicStats,
      topUsers,
      recentActivity: {
        tests: recentTests,
        exams: recentExams,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données du dashboard admin :",
      error
    );
    return res
      .status(500)
      .json({ message: "Erreur serveur.", error: error.message });
  }
};

const getLatestFiveNews = async (req, res) => {
  try {
    const cachedNews = newsCache.get("lastFourNews");

    
    if (!cachedNews || cachedNews.length === 0) {
      return res.status(400).json({ success: false, message: "Aucun article en cache. Attendez quelques instants..." });
    }


    return res.status(200).json({
      article: cachedNews[0],
      recentArticles: cachedNews.slice(1, 4),
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des news :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des news.",
      error: error.message,
    });
  }
};

// Fonction pour récupérer 3 autres articles récents (hors celui affiché)
const getOtherRecentArticles = async (excludeLink) => {
  try {
    const feedResults = await Promise.allSettled(
      rssFeeds.map(async (url) => {
        try {
          const feed = await parser.parseURL(url.trim());
          return feed.items.map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: new Date(item.pubDate),
            itemData: item,
          }));
        } catch (err) {
          console.error(`Erreur lors de la récupération du RSS (${url}):`, err);
          return [];
        }
      })
    );

    // Aplatir, filtrer et trier en une seule opération
    const allArticles = feedResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value)
      .filter((article) => article.link !== excludeLink)
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, 3);

    // Paralléliser l'extraction d'image
    return await Promise.all(
      allArticles.map(async (article) => ({
        title: article.title,
        link: article.link,
        pubDate: article.pubDate,
        image: await extractImageFromItem(article.itemData),
      }))
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des articles récents :", error);
    return [];
  }
};

const rephraseFullContent = createCache(async (originalContent) => {
  try {
    const systemMessage = `You are an advanced AI specializing in content reformulation.
    
    CONTEXT:
    - Below is an article excerpt:
    
    ORIGINAL CONTENT:
    "${originalContent}"
    
    YOUR TASK:
    - Reformulate the content while keeping the same meaning.
    - Use different vocabulary and sentence structures.
    - Ensure clarity and a natural writing flow.
    - Avoid repetition and make it concise.
    
    Output only the reformulated content, without additional comments.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Tester gpt-3.5-turbo si besoin
      messages: [{ role: "system", content: systemMessage }],
      temperature: 0.7,
    });

    const response = completion.choices?.[0]?.message?.content || originalContent;
    

    return response;
  } catch (error) {
    console.error("Erreur de reformulation complète du contenu :", error);
    return originalContent; // En cas d'échec, on retourne le contenu original
  }
});

// Endpoint pour récupérer un article spécifique et reformuler son contenu
const getArticleByLink = async (req, res) => {
  try {
    const { link } = req.query;
    if (!link) {
      return res.status(400).json({ success: false, message: "Lien de l'article requis." });
    }

    // Rechercher les articles dans tous les flux en parallèle
    const feedResults = await Promise.allSettled(
      rssFeeds.map(async (url) => {
        try {
          const feed = await parser.parseURL(url.trim());
          return feed.items.find((item) => item.link === link) || null;
        } catch (err) {
          console.error(`Erreur lors de la récupération du RSS (${url}):`, err);
          return null;
        }
      })
    );

    // Trouver le premier article non null
    const foundArticle = feedResults.find((result) => result.status === "fulfilled" && result.value !== null)?.value;

    if (!foundArticle) {
      return res.status(404).json({ success: false, message: "Article non trouvé." });
    }

    // Reformulation et extraction d'image en parallèle
    const [content, image] = await Promise.all([
      rephraseFullContent(foundArticle["content:encoded"] || foundArticle.content || foundArticle.description || "Pas de contenu disponible"),
      extractImageFromItem(foundArticle),
    ]);

    // Récupérer les autres articles récents
    const otherRecentArticles = await getOtherRecentArticles(foundArticle.link);

    return res.status(200).json({
      article: {
        title: foundArticle.title,
        link: foundArticle.link,
        pubDate: new Date(foundArticle.pubDate),
        content,
        image,
      },
      recentArticles: otherRecentArticles,
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de l'article :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'article.",
      error: error.message,
    });
  }
};
// Fonction optimisée pour extraire l'image
async function extractImageFromItem(item) {
  if (!item) return null;

  // 1️⃣ Vérifier si une image est définie directement
  if (item.image?.url) return item.image.url;
  if (item.enclosure?.url) return item.enclosure.url;

  // 2️⃣ Extraire depuis le contenu HTML si possible
  const extractImageFromHtml = (html) => {
    if (!html) return null;
    const $ = cheerio.load(html);
    return $("img").first().attr("src") || null;
  };

  const imageFromContent = extractImageFromHtml(item["content:encoded"]);
  if (imageFromContent) return imageFromContent;

  const imageFromDescription = extractImageFromHtml(item.description);
  if (imageFromDescription) return imageFromDescription;

  // 3️⃣ Si toujours rien, tenter de scraper la page (fallback)
  return await fetchImageFromWebpage(item.link);
}

// Fonction pour récupérer l'image depuis la page de l'article (fallback)
async function fetchImageFromWebpage(url) {
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(data);
    return (
      $("meta[property='og:image'], meta[name='twitter:image']").attr(
        "content"
      ) ||
      $("img").first().attr("src") ||
      null
    );
  } catch (error) {
    console.error(
      `Erreur lors de l'extraction d'image depuis la page (${url}):`,
      error.message
    );
    return null;
  }
}

module.exports = {
  getDashboardInfo,
  getAdminDashboardInfo,
  getLatestFiveNews,
  getArticleByLink
};
