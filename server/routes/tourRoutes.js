const express = require('express');
const {
  createTour,
  getAllTours,
  deleteTour,
  updateTour,
  getTour,
  aliasTopFiveTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const { protect, restrict } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const router = express.Router();

// router.param('id', checkID);
router.route('/top-5-tours').get(aliasTopFiveTours);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/stats').get(getTourStats);
router.route('/').get(getAllTours).post(protect, restrict, createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrict, deleteTour);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
