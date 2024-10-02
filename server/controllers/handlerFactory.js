const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(new AppError(`document not found with given ID`, 404));
    }
    res.status(204).json({
      status: 'success',
      message: `document deleted successfully`,
      data: null,
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    const doc = await Model.findByIdAndUpdate(id, body, { new: true });
    if (!doc) {
      return next(new AppError('Document not found with given ID', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Document updated successfully',
      data: { data: doc },
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const body = req.body;

    const doc = await Model.create(body);
    res.status(201).json({
      status: 'success',
      message: 'Document created successfully',
      data: { data: doc },
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id;
    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('Document not found with given ID', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Document fetched successfully',
      data: { data: doc },
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    // To allow nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //Execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      message: 'Documents fetched successfully',
      results: docs.length,
      data: { data: docs },
    });
  });
};
