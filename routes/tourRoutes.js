const express = require('express');
const tourController = require('./../controllers/tourController');

const tourRouter = express.Router();
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// tourRouter.param('id', tourController.checkID);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);

// :id 是一个路由参数（Route Parameter）的占位符。
// 它表示在这个路径的位置可以匹配任何值，并且这个值将作为参数传递给路由处理函数。
// 在这个例子中，:id 表示一个旅游ID，这个ID的值可以在请求中的 req.params 对象中找到。
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
tourRouter
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = tourRouter;