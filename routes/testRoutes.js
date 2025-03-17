const express = require('express');
const TestControlleur  = require('../controllers/testController');
const router = express.Router();

router.post('/start', TestControlleur.executeTest);
router.post('/saveTest', TestControlleur.saveTest);
router.post('/validate', TestControlleur.validateTest);
router.post('/searchTest', TestControlleur.NewTestBySearch);
router.get('/list/:userId', TestControlleur.listUnfinishedTests);
router.get('/continueTest/:testId', TestControlleur.continueTest);
router.delete('/supprimeTest', TestControlleur.supprimeTest);
router.get('/resumeTest', TestControlleur.resumeTest);
router.get('/count-unfinished', TestControlleur.countUnfinishedTest);
router.get('/search/:keyword/:country/:topic_id/:last_exam', TestControlleur.searchTest);

module.exports = router;
