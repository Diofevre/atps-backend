const { ForumComment, User } = require("../models");

const createComment = async (req, res) => {
  const { post_id, content, parent_comment_id } = req.body;
  const user_id = req.auth.userId;
  if (!user_id) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const newComment = await ForumComment.create({
      post_id,
      user_id,
      content,
      parent_comment_id: parent_comment_id || null,
    });

    res
      .status(201)
      .json({ message: "Commentaire créé avec succès", comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getAllCommentsForPost = async (req, res) => {
  const { post_id } = req.params;

  try {
    const comments = await ForumComment.findAll({
      where: { post_id },
      include: [
        {
          model: User,
          as: "user", // Le modèle User est associé avec l'alias 'user'
          attributes: ["name", "username", "picture"],
        },
        {
          model: ForumComment,
          as: "parent", // Réponses aux commentaires (si disponibles)
          attributes: ["id", "content"],
        },
      ],
      order: [["createdAt", "ASC"]], // Trier par date de création (ascendant)
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const getCommentWithReplies = async (req, res) => {
  const { comment_id } = req.params;

  try {
    const comment = await ForumComment.findOne({
      where: { id: comment_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "username", "picture"],
        },
        {
          model: ForumComment,
          as: "replies", // Réponses au commentaire
          where: { parent_comment_id: comment_id }, // Filtrer par le parent_comment_id
          attributes: ["id", "content", "createdAt"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name", "username", "picture"],
            },
          ],
        },
      ],
    });

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    res.status(200).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const updateComment = async (req, res) => {
  const { comment_id } = req.params;
  const { content } = req.body;

  try {
    const comment = await ForumComment.findByPk(comment_id);

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    comment.content = content;
    await comment.save();

    res
      .status(200)
      .json({ message: "Commentaire mis à jour avec succès", comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

const deleteComment = async (req, res) => {
  const { comment_id } = req.params;

  try {
    const comment = await ForumComment.findByPk(comment_id);
    const commentChild = await ForumComment.findAll({where: {parent_comment_id: comment_id}});

    if (!comment) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }

    if (commentChild) {
       commentChild.forEach(async (child) => {
        await child.destroy();
      });
    }

    await comment.destroy();
    

    res.status(200).json({ message: "Commentaire supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  createComment,
  getAllCommentsForPost,
  getCommentWithReplies,
  updateComment,
  deleteComment,
};
