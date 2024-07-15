const APIFeatures = require('../utils/apiFeatures');
const Tour = require('../Model/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// exports.checkID = (req, res, next, val) => {
//   console.log(val, '====>');
//   if (!val) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

exports.aliasTopFiveTours = (req, res, next) => {
  req.query.limit = '5';
  req.query = {
    ...req.query,
    ratingsAverage: { gt: 4.6 },
  };
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary,duartion';

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //Execute query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const allTours = await features.query;

  res.status(200).json({
    status: 'success',
    message: 'Tours data fetched successfully',
    results: allTours.length,
    data: { tours: allTours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError('Tour not found with given ID', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Tour data fetched successfully',
    data: { tour: tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const body = req.body;

  const newTour = await Tour.create(body);
  res.status(201).json({
    status: 'success',
    message: 'Tour created successfully',
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const body = req.body;
  const tour = await Tour.findByIdAndUpdate(id, body, { new: true });
  if (!tour) {
    return next(new AppError('Tour not found with given ID', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Tour updated successfully',
    data: { tour: tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) {
    return next(new AppError('Tour not found with given ID', 404));
  }
  res.status(204).json({
    status: 'success',
    message: 'Tour deleted successfully',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        totalTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    message: 'Tour stats fetched successfully',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: {
          $push: {
            name: '$name',
            id: '$_id',
          },
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Monthly plan fetched successfully',
    data: { plan },
  });
});
