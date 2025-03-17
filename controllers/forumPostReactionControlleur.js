const { PostReaction } = require('../models');

const reactToPost = async (req, res) => {
    try {
        const { post_id, reaction_type } = req.body;
        const user_id = req.auth.userId;

        if (!post_id || !reaction_type) {
            return res.status(400).json({ error: "Post ID et reaction_type sont requis" });
        }

        if (!['like', 'dislike'].includes(reaction_type)) {
            return res.status(400).json({ error: "reaction_type doit être 'like' ou 'dislike'" });
        }

        // Vérifier si l'utilisateur a déjà réagi au post
        const existingReaction = await PostReaction.findOne({
            where: { post_id, user_id }
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
        const newReaction = await PostReaction.create({ post_id, user_id, reaction_type });
        res.status(201).json({ message: "Réaction ajoutée", reaction: newReaction });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

const countPostReactions = async (req, res) => {
    try {
        const { post_id } = req.params;

        const likes = await PostReaction.count({
            where: { post_id, reaction_type: 'like' }
        });

        const dislikes = await PostReaction.count({
            where: { post_id, reaction_type: 'dislike' }
        });

        res.status(200).json({ post_id, likes, dislikes });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

module.exports = { reactToPost, countPostReactions };


