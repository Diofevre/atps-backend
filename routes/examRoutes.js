const express = require('express');
const { createExam, saveExam, validateExam, getUnfinishedExamsForUser, reinitexam } = require('../controllers/examControlleur');
const router = express.Router();

// Route pour créer un examen
router.post('/create', createExam);
router.post('/save', saveExam);
router.post('/validate',validateExam );
router.post('/reinit', reinitexam);
router.get('/list', getUnfinishedExamsForUser);



module.exports = router;
