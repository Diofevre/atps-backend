const { Op } = require('sequelize');
const { Video, Topic, Channel, ReactionVideo } = require('../models');
const sequelize = require('../config/db');

const getVideosByTopic = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { topic_id, keyword } = req.params;

        // Options de recherche pour les vidéos
        const videoSearchOptions = {
            where: {
                topic_id: topic_id,
            },
            include: [
                {
                    model: Topic,
                    as: 'topic',
                    where: { id: topic_id },
                    attributes: ['topic_name'],
                },
                {
                    model: Channel,
                    as: "channel",
                    attributes: ['channel_name', 'channel_profile_image', 'genre', 'language'],
                },
            ],
            order: [['created_at', 'ASC']],
            transaction,
        };

        // Ajouter le filtre `keyword` si présent
        if (typeof keyword === "string" && keyword.trim() !== "" && keyword.trim() !== "null") {
            videoSearchOptions.where[Op.or] = [
                { title: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } }
            ];
        }

        // Récupérer les vidéos
        const videos = await Video.findAll(videoSearchOptions);

        // Vérifier si des vidéos ont été trouvées
        if (!videos || videos.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Aucune vidéo trouvée pour ce topic." });
        }

        // Récupérer les réactions (likes/dislikes) pour toutes les vidéos
        const videoIds = videos.map(video => video.id);

        const reactions = await ReactionVideo.findAll({
            attributes: [
                'video_id',
                'reaction_type',
                [sequelize.fn('COUNT', sequelize.col('reaction_type')), 'count']
            ],
            where: { video_id: { [Op.in]: videoIds } },
            group: ['video_id', 'reaction_type'],
            transaction,
        });

        // Transformer les réactions en un format utilisable
        const reactionsMap = {};
        reactions.forEach(reaction => {
            const videoId = reaction.video_id;
            const type = reaction.reaction_type;
            const count = reaction.get('count');

            if (!reactionsMap[videoId]) reactionsMap[videoId] = { like: 0, dislike: 0 };
            reactionsMap[videoId][type] = count;
        });

        // Préparer la réponse
        const response = {
            topic: videos[0].topic.topic_name,
            channel_name: videos[0].channel.channel_name,
            channel_profile_image: videos[0].channel.channel_profile_image,
            genre: videos[0].channel.genre,
            language: videos[0].channel.language,
            videos: videos.map(video => ({
                id: video.id,
                title: video.title,
                youtube_url: video.youtube_url,
                duration: video.duration,
                description: video.description,
                thumbnail_url: video.thumbnail_url,
                likes: reactionsMap[video.id]?.like || 0,
                dislikes: reactionsMap[video.id]?.dislike || 0,
            }))
        };

        await transaction.commit();
        return res.status(200).json(response);

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Erreur lors de la récupération des vidéos : ", error);
        return res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des vidéos." });
    }
};

const getVideoById = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { video_id } = req.params;

        // Récupérer une seule vidéo par son ID
        const video = await Video.findByPk(video_id, {
            include: [
                {
                    model: Topic,
                    as: 'topic',
                    attributes: ['topic_name'],
                },
            ],
            transaction,
        });

        // Vérifier si la vidéo existe
        if (!video) {
            await transaction.rollback();
            return res.status(404).json({ message: "Aucune vidéo trouvée pour cet ID." });
        }

        // Récupérer les réactions (likes/dislikes) pour cette vidéo
        const reactions = await ReactionVideo.findAll({
            attributes: [
                'reaction_type',
                [sequelize.fn('COUNT', sequelize.col('reaction_type')), 'count'],
            ],
            where: { video_id },
            group: ['reaction_type'],
            transaction,
        });

        // Transformer les réactions en un format utilisable
        const reactionsMap = { like: 0, dislike: 0 };
        reactions.forEach(reaction => {
            reactionsMap[reaction.reaction_type] = parseInt(reaction.get('count'), 10) || 0;
        });

        // Préparer la réponse avec toutes les données nécessaires
        const response = {
            id: video.id,
            title: video.title,
            youtube_url: video.youtube_url,
            duration: video.duration,
            description: video.description,
            thumbnail_url: video.thumbnail_url,
            topic: video.topic.topic_name,
            likes: reactionsMap.like,
            dislikes: reactionsMap.dislike,
        };

        await transaction.commit(); // Valider la transaction
        return res.status(200).json(response);

    } catch (error) {
        if (transaction) await transaction.rollback(); // Annuler la transaction en cas d'erreur
        console.error("Erreur lors de la récupération de la vidéo : ", error);
        return res.status(500).json({ message: "Une erreur s'est produite lors de la récupération de la vidéo." });
    }
};


module.exports = { getVideosByTopic, getVideoById };
