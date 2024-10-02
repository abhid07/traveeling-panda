const express = require('express');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
  getOneReview,
} = require('../controllers/reviewController');

const { protect, restrict } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, setTourUserIds, createReview);

router
  .route('/:id')
  .get(protect, getOneReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
