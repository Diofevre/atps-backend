const {ReactionVideo} = require("../models");
const sequelize = require("../config/db");

const countReactions = async (videoId, reactionType) => {
  try {
    const count = await ReactionVideo.count({
      where: {
        video_id: videoId,
        reaction_type: reactionType,
      },
    });
    return count;
  } catch (error) {
    console.error(`Error counting ${reactionType} reactions:`, error);
    return 0;
  }
};


const createReaction = async (req, res) => {
  const {videoId, type } = req.body;
  const userId = req.auth.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    if (!userId || !videoId) {
      return res.status(400).json({ message: "Invalid or missing parameters." });
    }

    let newReaction;

    // Utiliser des transactions pour garantir l'intégrité des données
    await sequelize.transaction(async (t) => {
      const existingReaction = await ReactionVideo.findOne({
        where: { user_id: userId, video_id: videoId },
        transaction: t,
      });

      if (existingReaction) {
        newReaction = await existingReaction.update(
          { reaction_type: existingReaction.reaction_type ? null : type },
          { transaction: t }
        );
      } else {
        newReaction = await ReactionVideo.create(
          { user_id: userId, video_id: videoId, reaction_type: type },
          { transaction: t }
        );
      }
    });

    res.status(201).json({
      message: "Reaction recorded successfully.",
      reaction: newReaction,
    });
  } catch (error) {
    console.error("Error recording reaction:", error);
    res.status(500).json({
      message: "An error occurred while recording the reaction.",
      error: error.message,
    });
  }
};

module.exports = {
  countReactions,
  createReaction,
};
