const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const tourRouter = express.Router();
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// 如果路径是形如/:tourId/reviews，就redirect到reviewRouter。
tourRouter.use('/:tourId/reviews', reviewRouter);
// 记住，router本质上也是中间件。

// tourRouter.param('id', tourController.checkID);

tourRouter
    .route('/tour-stats')
    .get(tourController.getTourStats);

tourRouter
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter
    .route('/monthly-plan/:year')
    .get(
        authController.protect, 
        authController.restricTo('admin', 'lead-guide'), // 设置为只有这俩角色可以访问。
        tourController.getMonthlyPlan
    );

tourRouter
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect, 
        authController.restricTo('admin','lead-guide'),
        tourController.createTour);

// :id 是一个路由参数（Route Parameter）的占位符。
// 它表示在这个路径的位置可以匹配任何值，并且这个值将作为参数传递给路由处理函数。
// 在这个例子中，:id 表示一个旅游ID，这个ID的值可以在请求中的 req.params 对象中找到。
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
tourRouter
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect, 
        authController.restricTo('admin', 'lead-guide'), // 设置为只有这俩角色可以访问。
        tourController.updateTour)
    .delete(
        authController.protect, 
        authController.restricTo('admin', 'lead-guide'), // 设置为只有这俩角色可以访问。
        tourController.deleteTour
    );

// tourRouter
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restricTo('user'), //设置限制什么角色能访问
//         tourController.createTour
//     );

module.exports = tourRouter;