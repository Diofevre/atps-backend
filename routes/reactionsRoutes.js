const express = require('express');
const { createReaction } = require('../controllers/reactionControlleur');
const router = express.Router();

router.post('/create', createReaction);

module.exports = router;
