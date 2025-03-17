const Chapter = require('../models/chapterModel');  

// Create a new chapter
exports.createChapter = async (req, res) => {
  try {
    const { chapter_text, topic_id } = req.body;
    const chapter = await Chapter.create({
      chapter_text,
      topic_id,
    });
    return res.status(201).json({
      message: 'Chapter created successfully',
      data: chapter
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating chapter',
      error: error.message
    });
  }
};

// Get all chapters
exports.getAllChapters = async (req, res) => {
  try {
    const chapters = await Chapter.findAll();
    return res.status(200).json({
      message: 'Chapters fetched successfully',
      data: chapters
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching chapters',
      error: error.message
    });
  }
};

// Get a specific chapter by ID
exports.getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByPk(id);

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found'
      });
    }

    return res.status(200).json({
      message: 'Chapter fetched successfully',
      data: chapter
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching chapter',
      error: error.message
    });
  }
};

// Update a chapter by ID
exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_text, topic_id } = req.body;

    const chapter = await Chapter.findByPk(id);

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found'
      });
    }

    chapter.chapter_text = chapter_text || chapter.chapter_text;
    chapter.topic_id = topic_id || chapter.topic_id;
    await chapter.save();

    return res.status(200).json({
      message: 'Chapter updated successfully',
      data: chapter
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating chapter',
      error: error.message
    });
  }
};

// Soft delete a chapter by ID
exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByPk(id);

    if (!chapter) {
      return res.status(404).json({
        message: 'Chapter not found'
      });
    }

    // Utilisation du soft delete (ne supprime pas réellement mais marque comme supprimé)
    await chapter.destroy();

    return res.status(200).json({
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting chapter',
      error: error.message
    });
  }
};


exports.getChaptersByTopic = async (req, res) => {
  try {
    const { topic_id } = req.params;

    if (!topic_id) {
      return res.status(400).json({ message: "L'ID du topic est requis." });
    }

    const chapters = await Chapter.findAll({ where: { topic_id } });

    return res.status(200).json(chapters);
  } catch (error) {
    return res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
};
