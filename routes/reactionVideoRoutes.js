const express = require('express');
const { createReaction } = require('../controllers/reactionVideoControlleur');
const router = express.Router();

router.post('/create', createReaction);

module.exports = router;
