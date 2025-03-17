const express = require('express');
const router = express.Router();
const { getLatestFiveNews, getArticleByLink } = require('../controllers/dashboardControlleur');

router.get("/", getLatestFiveNews);
/*router.get("/link", getArticleByLink);*/


module.exports = router;
