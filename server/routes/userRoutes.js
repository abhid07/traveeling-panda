const express = require('express');
const router = express.Router();
const {
  deleteUser,
  getAllUsers,
  updateUser,
  getUser,
  getMe,
} = require('../controllers/userController');
const {
  signUp,
  logIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/authController');

router.route('/signup').post(signUp);
router.route('/login').post(logIn);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updatePassword').patch(protect, updatePassword);

router.route('/getMe').get(protect, getMe, getUser);
router.route('/updateMe').patch(protect, updateUser);
router.route('/deleteMe').delete(protect, deleteUser);
router.route('/getUsersList').get(protect, getAllUsers);
router.route('/:id').get(protect, getUser);

module.exports = router;
