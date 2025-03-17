const  {TestSubChapter}  = require('../models');

const createTestSubChapter = async (test_id, sub_chapter_id) => {
    try {
      if (!Array.isArray(sub_chapter_id)) {
        throw new Error('sub_chapter_id must be an array.');
      }
  
      const newTestSubChapter = await TestSubChapter.create({
        test_id,
        sub_chapter_id,
      });
      return newTestSubChapter; 
    } catch (error) {
      throw new Error(`Failed to create TestSubChapter: ${error.message}`);
    }
  };
  

module.exports = {
  createTestSubChapter,
};
