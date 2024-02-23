
const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');


exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
    // 如果没在body中指定tour，那么就用query中的tourId参数。
    if(!req.body.tour) req.body.tour = req.params.tourId;

    // 如果没在body中指定user，那么就用当前正在使用的user的id。
    if(!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
