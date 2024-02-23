const Tour = require('./../models/tourModel');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// Tour是一个schema。

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

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

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-distane/223/center/-40,45/unit/mi
exports.getToursWithin = catchAsync(async(req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng.',
                400)
        );
    }
    // console.log(distance, lat, lng, unit);
    const tours = await Tour.find({ 
        startLocation: { $geoWithin: {$centerSphere: [[lng, lat], radius]} } 
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async(req, res, next) => {
    const { latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    // const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the format lat,lng.',
                400)
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                // $geoNear always needs to be the 1st stage.
                // 如果有多个字段都带有geospatial indexes，就需要使用keys参数来定义计算用的字段。
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});