const SubChapter = require('../models/subChapterModel');

// Create a new subchapter
exports.createSubChapter = async (req, res) => {
  try {
    const { sub_chapter_text, chapter_id } = req.body;
    const subChapter = await SubChapter.create({
      sub_chapter_text,
      chapter_id,
    });
    return res.status(201).json({
      message: 'SubChapter created successfully',
      data: subChapter,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating subchapter',
      error: error.message,
    });
  }
};

// Get all subchapters
exports.getAllSubChapters = async (req, res) => {
  try {
    const subChapters = await SubChapter.findAll();
    return res.status(200).json({
      message: 'SubChapters fetched successfully',
      data: subChapters,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching subchapters',
      error: error.message,
    });
  }
};

// Get a specific subchapter by ID
exports.getSubChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const subChapter = await SubChapter.findByPk(id);

    if (!subChapter) {
      return res.status(404).json({
        message: 'SubChapter not found',
      });
    }

    return res.status(200).json({
      message: 'SubChapter fetched successfully',
      data: subChapter,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching subchapter',
      error: error.message,
    });
  }
};

// Update a subchapter by ID
exports.updateSubChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { sub_chapter_text, chapter_id } = req.body;

    const subChapter = await SubChapter.findByPk(id);

    if (!subChapter) {
      return res.status(404).json({
        message: 'SubChapter not found',
      });
    }

    subChapter.sub_chapter_text = sub_chapter_text || subChapter.sub_chapter_text;
    subChapter.chapter_id = chapter_id || subChapter.chapter_id;
    await subChapter.save();

    return res.status(200).json({
      message: 'SubChapter updated successfully',
      data: subChapter,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating subchapter',
      error: error.message,
    });
  }
};

// Delete a subchapter by ID
exports.deleteSubChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const subChapter = await SubChapter.findByPk(id);

    if (!subChapter) {
      return res.status(404).json({
        message: 'SubChapter not found',
      });
    }

    await subChapter.destroy();

    return res.status(200).json({
      message: 'SubChapter deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting subchapter',
      error: error.message,
    });
  }
};

exports.getSubChaptersByChapter = async (req, res) => {
  try {
    const { chapter_id } = req.params;

    if (!chapter_id) {
      return res.status(400).json({ message: "L'ID du chapitre est requis." });
    }

    const subChapters = await SubChapter.findAll({ where: { chapter_id } });

    return res.status(200).json(subChapters);
  } catch (error) {
    return res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
};
