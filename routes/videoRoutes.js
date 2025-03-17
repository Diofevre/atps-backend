const express = require('express');
const { getVideosByTopic, getVideoById } = require('../controllers/videoControlleur'); 
const router = express.Router();

router.get('/topic/:topic_id/search/:keyword?', getVideosByTopic);

router.get('/:video_id', getVideoById);

module.exports = router;
