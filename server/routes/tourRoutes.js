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
  // checkID,
} = require('../controllers/tourController');

const router = express.Router();

// router.param('id', checkID);
router.route('/top-5-tours').get(aliasTopFiveTours, getAllTours);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/stats').get(getTourStats);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).put(updateTour).delete(deleteTour);

module.exports = router;
