const {User, Comment} = require('../models');
const {countReactions} = require('./reactionControlleur');
const sequelize = require("../config/db");

const createComment = async (req, res) => {
    const { questionId, content } = req.body;
    const userId = req.auth.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
  
    try {
      if (!userId || !questionId || !content) {
        return res.status(400).json({ message: "Missing required parameters." });
      }
   
      const newComment = await Comment.create({
        user_id: userId,
        question_id: questionId,
        content: content,
      });
  
      res.status(201).json({ message: "Comment created successfully.", comment: newComment });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "An error occurred while creating the comment.", error: error.message });
    }
  };

  const listComments = async (req, res) => {
    const { questionId } = req.params;
  
    try {
      if (!questionId) {
        return res.status(400).json({ message: "Question ID is required." });
      }
  
      const comments = await Comment.findAll({
        where: { question_id: questionId },
        include: [{ model: User, as: "user", attributes: ["username"] }],
        order: [["created_at", "DESC"]],
      });
  
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
  
      res.status(200).json({ comments: commentsWithReactions });
    } catch (error) {
      console.error("Error listing comments:", error);
      res.status(500).json({ message: "An error occurred while listing the comments.", error: error.message });
    }
  };

  const updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.auth.userId;
  
    try {
      if (!commentId || !content) {
        return res.status(400).json({ message: "Comment ID and content are required." });
      }
  
      // Vérifier que le commentaire existe et appartient à l'utilisateur
      const comment = await Comment.findOne({ where: { id: commentId, user_id: userId } });
  
      if (!comment) {
        return res.status(404).json({ message: "Comment not found or unauthorized." });
      }
  
      comment.content = content;
      await comment.save();
  
      res.status(200).json({ message: "Comment updated successfully.", comment });
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "An error occurred while updating the comment.", error: error.message });
    }
  };
  
  const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.auth.userId;
  
    try {
      if (!commentId) {
        return res.status(400).json({ message: "Comment ID is required." });
      }
  
      // Vérifier que le commentaire existe et appartient à l'utilisateur
      const comment = await Comment.findOne({ where: { id: commentId, user_id: userId } });
  
      if (!comment) {
        return res.status(404).json({ message: "Comment not found or unauthorized." });
      }
  
      await Comment.destroy({ where: { id: commentId } });
  
      res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "An error occurred while deleting the comment.", error: error.message });
    }
  };
  
  
  module.exports = {
    createComment,
    listComments,
    updateComment,
    deleteComment

  };