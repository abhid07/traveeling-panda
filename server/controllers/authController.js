const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Model/User');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/mail');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: process?.env?.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req?.body?.role,
  });
  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (user) {
    const isPasswordMatch = await user.correctPassword(password, user.password);

    if (isPasswordMatch) {
      createSendToken(user, 200, res);
    } else {
      next(new AppError('Incorrect password', 401));
    }
  } else {
    next(new AppError('User not found', 404));
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = req?.headers?.authorization;
  if (token && token?.startsWith('Bearer')) {
    token = token.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Inavlid token. Please log in again!', '401'));
  }
  decoded = await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) {
      return decoded;
    }
    if (err) {
      return next(err);
    }
  });
  const { id } = decoded;
  const user = await User.findById(id);
  if (!user) {
    return next(
      new AppError('The user belongs to this token no longer exists', '401')
    );
  }
  req.user = user;
  next();
});

exports.restrict = (req, res, next) => {
  if (req?.user?.role !== 'admin') {
    return next(new AppError('You are not allowed to perform this operation'));
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  // generate token random
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it user's mail
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user?.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err, 'error');
    return next(
      new AppError(
        'There was an error sending the email. Try again later! ',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken });
  if (!user) {
    return next(new AppError('Token is invalid', 400));
  }
  if (user.passwordResetExpires < Date.now()) {
    return next(new AppError('Token has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  createSendToken(user, 200, res);
});
