const User = require('../Model/User');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, getOne, getAll } = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const allowedObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      allowedObj[el] = obj[el];
    }
  });
  return allowedObj;
};

exports.getAllUsers = getAll(User);

exports.getMe = ((req,res,next)=>{
  req.params.id = req.user.id;
  next();
})
exports.getUser = getOne(User);

exports.updateUser = catchAsync(async (req, res) => {
  if (req?.body?.password || req?.body?.confirmPassword) {
    return res.status(400).json({
      status: 'error',
      message:
        'This route is not for password updates. Please use /updatePassword route',
    });
  }
  const filteredBody = filterObj(req?.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req?.user?.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = deleteOne(User);
