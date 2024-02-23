const express = require('express');
const reviewController = require('../controllers/reviewController');

const authController = require('../controllers/authController');

const reviewRouter = express.Router({mergeParams: true});

// POST /tour/234fasd/reviews
// POST /reviews

reviewRouter.use(authController.protect);

reviewRouter
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        // 只有用户可以评论，导游和管理员不可以。
        authController.restricTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    );

reviewRouter
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restricTo('user', 'admin'), 
        reviewController.updateReview
    )
    .delete(
        authController.restricTo('user', 'admin'), 
        reviewController.deleteReview
    );

module.exports = reviewRouter;