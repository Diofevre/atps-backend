const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController'); 


router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionDetailById);
router.get("/sub_chapters/:sub_chapter_id", questionController.getQuestionsBySubChapter);
router.get("/chapters/:chapter_id", questionController.getQuestionsByChapter);
router.get("/topics/:topic_id", questionController.getQuestionsByTopic);
router.post('/', questionController.createQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);
//router.post('/validate-answer', questionController.isAnswerCorrect);
router.post('/pin', questionController.updateTags);
router.get('/:question_id/:test_id/:exam_id', questionController.getQuestionById);
router.post('/ameliorate', questionController.ameliorateQuestion);
router.delete('/chatExplanation/:chat_explanation_id', questionController.deleteChatExplanation);
router.post('/details', questionController.createTopicWithChapterSubChapterAndQuestions);


module.exports = router;
