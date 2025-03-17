const {
  ForumPost,
  User,
  PostHashtag,
  Hashtag,
  ForumComment,
  PostReaction,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

const getAllPosts = async (req, res) => {
  const { keyword } = req.query;

  try {
    const whereCondition = keyword
      ? {
          [Op.or]: [
            { title: { [Op.like]: `%${keyword}%` } },
            { content: { [Op.like]: `%${keyword}%` } },
            { "$hashtags.name$": { [Op.like]: `%${keyword}%` } },
          ],
        }
      : {};

    const posts = await ForumPost.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "user_id",
        "category_id",
        "title",
        "content",
        "image_url",
        "createdAt",
        "updatedAt",
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.fn("DISTINCT", Sequelize.col("post_reactions.id"))
          ),
          "total_reactions",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("DISTINCT IF(reaction_type = 'like', 1, 0)")
          ),
          "likes_count",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("DISTINCT IF(reaction_type = 'dislike', 1, 0)")
          ),
          "dislikes_count",
        ],
        [
          Sequelize.fn("COUNT", Sequelize.col("forum_comments.id")),
          "total_comments",
        ],
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "username", "picture"],
        },
        {
          model: Hashtag,
          as: "hashtags",
          attributes: ["name"],
          required: false,
        },
        {
          model: PostReaction,
          as: "post_reactions",
          attributes: [],
        },
        {
          model: ForumComment,
          as: "forum_comments",
          attributes: [],
        },
      ],
      group: [
        "ForumPost.id",
        "user.id",
        "user.name",
        "user.username",
        "user.picture",
        "hashtags.id",
        "hashtags.name",
      ],
    });

    const formattedPosts = posts.map((post) => ({
      ...post.toJSON(),
      hashtags: post.hashtags.map((hashtag) => hashtag.name),
    }));

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const createPost = async (req, res) => {
  const { category_id, title, content, image_url, hashtags } = req.body;
  const user_id = req.auth.userId;

  try {
    // Créer le post
    const newPost = await ForumPost.create({
      user_id,
      category_id,
      title,
      content,
      image_url,
    });

    // Vérifier et créer les hashtags, puis créer les relations
    if (hashtags && hashtags.length > 0) {
      for (let hashtagName of hashtags) {
        if (!hashtagName.startsWith("#")) {
          hashtagName = `#${hashtagName}`;
        }
        // Vérifier si le hashtag existe déjà
        let hashtag = await Hashtag.findOne({ where: { name: hashtagName } });

        if (!hashtag) {
          // Si le hashtag n'existe pas, créer un nouveau hashtag
          hashtag = await Hashtag.create({ name: hashtagName });
        }

        // Créer la relation entre le post et le hashtag
        await PostHashtag.create({
          post_id: newPost.id,
          hashtag_id: hashtag.id,
        });
      }
    }

    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const updatePost = async (req, res) => {
  const { post_id } = req.params; // ID du post à modifier
  const { title, content, image_url, hashtags } = req.body;

  try {
    // Trouver le post à modifier
    const post = await ForumPost.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    // Mettre à jour le post
    post.title = title;
    post.content = content;
    post.image_url = image_url;
    await post.save();

    // Supprimer les anciennes relations de hashtags pour ce post
    await PostHashtag.destroy({ where: { post_id: post.id } });

    // Ajouter les nouveaux hashtags
    if (hashtags && hashtags.length > 0) {
      for (const hashtagName of hashtags) {
        if (!hashtagName.startsWith("#")) {
          hashtagName = `#${hashtagName}`;
        }
        let hashtag = await Hashtag.findOne({ where: { name: hashtagName } });

        if (!hashtag) {
          hashtag = await Hashtag.create({ name: hashtagName });
        }

        await PostHashtag.create({
          post_id: post.id,
          hashtag_id: hashtag.id,
        });
      }
    }

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const deletePost = async (req, res) => {
  const { post_id } = req.params; // ID du post à supprimer

  try {
    // Supprimer les relations de hashtags
    await PostHashtag.destroy({ where: { post_id } });

    // Supprimer le post
    const result = await ForumPost.destroy({
      where: { id: post_id },
    });

    if (result === 0) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    res.status(200).json({ message: "Post supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getPostById = async (req, res) => {
  const { post_id } = req.params; // Récupérer l'ID du post depuis les paramètres

  try {
    const post = await ForumPost.findByPk(post_id, {
      attributes: [
        "id",
        "title",
        "content",
        "image_url",
        "createdAt",
        "updatedAt",
        // Nombre total de réactions
        [
          Sequelize.literal(`(
            SELECT COUNT(*) FROM post_reactions WHERE post_reactions.post_id = ForumPost.id
          )`),
          "total_reactions",
        ],
        // Nombre de likes
        [
          Sequelize.literal(`(
            SELECT  COUNT(*) FROM post_reactions WHERE post_reactions.post_id = ForumPost.id AND reaction_type = 'like'
          )`),
          "likes_count",
        ],
        // Nombre de dislikes
        [
          Sequelize.literal(`(
            SELECT  COUNT(*) FROM post_reactions WHERE post_reactions.post_id = ForumPost.id AND reaction_type = 'dislike'
          )`),
          "dislikes_count",
        ],
        // Nombre total de commentaires
        [
          Sequelize.literal(`(
            SELECT COUNT(*) FROM forum_comments WHERE forum_comments.post_id = ForumPost.id
          )`),
          "total_comments",
        ],
      ],
      include: [
        {
          model: User,
          as: "user",
          required: false, 
          attributes: ["name", "username", "picture"],
        },
        {
          model: Hashtag,
          as: "hashtags",
          required: false, 
          attributes: ["name"],
        },
        {
          model: ForumComment,
          as: "forum_comments", 
          attributes: [
            "id", "content", "createdAt", "user_id",
            [
              Sequelize.literal(`(
                SELECT  COUNT(*) FROM forum_comment_reactions 
                WHERE forum_comment_reactions.comment_id = forum_comments.id 
                AND reaction_type = 'like'
              )`),
              "likes_count"
            ],
            [
              Sequelize.literal(`(
                SELECT COUNT(*) FROM forum_comment_reactions 
                WHERE forum_comment_reactions.comment_id = forum_comments.id 
                AND reaction_type = 'dislike'
              )`),
              "dislikes_count"
            ]
          ],
          where: {
            parent_comment_id: null, // Filtrer pour ne récupérer que les commentaires principaux
          },
          required: false, // Permet de récupérer un post même s'il n'a pas de commentaires

          include: [
            {
              model: User,
              as: "user",
              attributes: ["name", "username", "picture"],
              required: false, 
            },
            {
              model: ForumComment,
              as: "replies", // Les réponses aux commentaires
              required: false,
              attributes: ["id", "content", "createdAt", "user_id",
                [
                  Sequelize.literal(`(
                    SELECT COUNT(*) FROM forum_comment_reactions 
                    WHERE forum_comment_reactions.comment_id = forum_comments.id 
                    AND reaction_type = 'like'
                  )`),
                  "likes_count"
                ],
                [
                  Sequelize.literal(`(
                    SELECT COUNT(*) FROM forum_comment_reactions 
                    WHERE forum_comment_reactions.comment_id = forum_comments.id 
                    AND reaction_type = 'dislike'
                  )`),
                  "dislikes_count"
                ]
              ],
             
              required: false, 
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["name", "username", "picture"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    // Transformer la réponse pour inclure la liste des hashtags sous forme de tableau de noms
    const formattedPost = {
      ...post.toJSON(),
      hashtags: post.hashtags.map((hashtag) => hashtag.name),
      forum_comments: post.forum_comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        likes_count:comment.get("likes_count"),
        dislikes_count: comment.get("dislikes_count"),
        user_id: comment.user_id,
        user: comment.user,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          likes_count: reply.get("likes_count"),
          dislikes_count: reply.get("dislikes_count"),
          user_id: reply.user_id,
          user: reply.user,
        })),
      })),
    };

    res.status(200).json(formattedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getUserPosts = async (req, res) => {
  const user_id = req.auth.userId;

  if (!user_id) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const posts = await ForumPost.findAll({
      where: { user_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "username", "picture"],
        },
        {
          model: Hashtag,
          as: "hashtags",
          attributes: ["name"],
        },
        {
          model: PostReaction,
          as: "post_reactions",
          attributes: [],
        },
        {
          model: ForumComment,
          as: "forum_comments",
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("post_reactions.id"))
            ),
            "total_reactions",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal("DISTINCT IF(reaction_type = 'like', 1, 0)")
            ),
            "likes_count",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal("DISTINCT IF(reaction_type = 'dislike', 1, 0)")
            ),
            "dislikes_count",
          ],
          [
            Sequelize.fn("COUNT", Sequelize.col("forum_comments.id")),
            "total_comments",
          ],
        ],
      },
      group: [
        "ForumPost.id",
        "user.id",
        "user.name",
        "user.username",
        "user.picture",
        "hashtags.id",
        "hashtags.name",
      ],
    });

    if (!posts.length) {
      return res
        .status(404)
        .json({ error: "Aucun post trouvé pour cet utilisateur" });
    }

    const formattedPosts = posts.map((post) => ({
      ...post.toJSON(),
      hashtags: post.hashtags.map((hashtag) => hashtag.name),
    }));

    res.status(200).json(formattedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getUserPosts,
};
