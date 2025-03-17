const { ForumCommentReaction } = require('../models');

const reactToComment = async (req, res) => {
    try {
        const { comment_id, reaction_type } = req.body;
        const user_id = req.auth.userId; // Assurez-vous que l'authentification est bien en place

        if (!comment_id || !reaction_type) {
            return res.status(400).json({ error: "Comment ID et reaction_type sont requis" });
        }

        if (!['like', 'dislike'].includes(reaction_type)) {
            return res.status(400).json({ error: "reaction_type doit être 'like' ou 'dislike'" });
        }

        // Vérifier si l'utilisateur a déjà réagi au commentaire
        const existingReaction = await ForumCommentReaction.findOne({
            where: { comment_id, user_id }
        });

        if (existingReaction) {
            if (existingReaction.reaction_type === reaction_type) {
                // Si la même réaction est refaite, on la supprime (toggle)
                await existingReaction.destroy();
                return res.status(200).json({ message: "Réaction supprimée" });
            } else {
                // Sinon, on met à jour la réaction
                existingReaction.reaction_type = reaction_type;
                await existingReaction.save();
                return res.status(200).json({ message: "Réaction mise à jour", reaction: existingReaction });
            }
        }

        // Sinon, créer une nouvelle réaction
        const newReaction = await ForumCommentReaction.create({ comment_id, user_id, reaction_type });
        res.status(201).json({ message: "Réaction ajoutée", reaction: newReaction });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

const countCommentReactions = async (req, res) => {
    try {
        const { comment_id } = req.params;

        const likes = await ForumCommentReaction.count({
            where: { comment_id, reaction_type: 'like' }
        });

        const dislikes = await ForumCommentReaction.count({
            where: { comment_id, reaction_type: 'dislike' }
        });

        res.status(200).json({ comment_id, likes, dislikes });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

module.exports = { reactToComment, countCommentReactions };
