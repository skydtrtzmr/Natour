// const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// Tour是一个schema。

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);
//     if (req.params.id * 1 > tours.length){
//         return res.status(404).json({
//             status: "fail",
//             message: "Invalid ID"
//         });
//     };
//     next();
// }

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status: "fail",
//             message: "Missing name or price"
//         });
//     };
//     next();
// }

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}



exports.getAllTours = catchAsync(async (req, res, next) => {
    // # EXECUTE QUERY
    const feature = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await feature.query;
    res
        .status(200)
        .json({
            status: 'success', 
            requestTime: req.requestTime,
            result: tours.length,
            data:{
                tours // `tours: tours` 可以简写一下
            }
        });
})

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        // new参数为true表示return新的document
        runValidators: true
    })
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res
    .status(200)
    .json({
        status: 'success', 
        // result: tours.length,
        data:{
            tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next)=>{
    const tour = await Tour.findByIdAndDelete(req.params.id, {
        new: true,
        // new参数为true表示return新的document
        runValidators: true
    })
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res
    .status(204)
    .json({
        status: 'delete success', 
        // result: tours.length,
        data: null,
        message: 'Delete success!'
    }); 
});

exports.createTour = catchAsync(async (req, res, next) => {
    // 把post传入的参数作为创建mongo文档的数据：
    const newTour = await Tour.create(req.body);
    // create返回一个promise。
    
    res.status(201).json({
        status: 'created! success',
        data:{
            tour: newTour
        }
    });
})
    // console.log(req.body);

    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({id: newId }, req.body);

    // tours.push(newTour);

    // writeFile这个函数接受三个参数：path, data, callback。
    // fs.writeFile(
    //     `${__dirname}/dev-data/data/tours-simple.json`, 
    //     JSON.stringify(tours), 
    //     err => {
    //         res.status(201).json({
    //             status: 'created! success',
    //             data:{
    //                 tour: newTour
    //             }
    //         });
    // });

    // res.send('Oh Yes Done'); 
    // 连着两次发送请求会导致报错：Cannot set headers after they are sent to the client
// }

exports.getTour = catchAsync(async (req, res, next) => {
    // 当你在定义 Express 路由时，如果在路由路径中使用了冒号 :，
    // 那么这部分就被认为是一个路由参数，并且 Express 会将这些参数存储在 req.params 对象中。
    const tour = await Tour.findById(req.params.id);
    // `Tour.findById(req.param.id)`等价于`Tour.findOne({_id: req.param.id})`

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res
    .status(200)
    .json({
        status: 'success', 
        // result: tours.length,
        data:{
            tour
        }
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: {$gte: 4.5} }
        },
        {
            $group: {
                // `_id`: 用来设置按照什么字段分组显示；如果为null则不分组。
                _id: { $toUpper: "$difficulty" }, 
                numTours: { $sum: 1 }, // 给每个文档的值为1，sum起来就成了总数。
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'},
            }
        },
        {
            $sort: { avgPrice: 1 }
            // `$sort1`里面，1 表示升序，-1 表示降序。
        },
        // {
        //     $match: {
        //         _id: { $ne: 'EASY'}
        //         // `$ne`表示 "not equal"，即不等于。
        //     }
        // }
    ]);

    res
    .status(200)
    .json({
        status: 'success', 
        // result: tours.length,
        data:{
            stats
        }
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
                    $lte: new Date(`${year}-12-31`)
                } 
            }
        },
        {
            $group: {
                // `_id`: 用来设置按照什么字段分组显示；如果为null则不分组。
                _id: { $month: "$startDates" }, 
                numTourStarts: { $sum: 1 }, // 给每个文档的值为1，sum起来就成了总数。
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project:{
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1, // `-1`表示降序
                // month: -1
            }
        },
        {
            $limit: 1
        }
        // {
        //     $sort: { avgPrice: 1 }
        //     // `$sort1`里面，1 表示升序，-1 表示降序。
        // },
        // {
        //     $match: {
        //         _id: { $ne: 'EASY'}
        //         // `$ne`表示 "not equal"，即不等于。
        //     }
        // }
    ]);

    res
    .status(200)
    .json({
        status: 'success', 
        // result: tours.length,
        data:{
            plan
        }
    });
});