const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewControlleur');

// Route to create a new review
router.post('/', reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.put('/:reviewId/seen', reviewController.markReviewAsSeen);

module.exports = router;
