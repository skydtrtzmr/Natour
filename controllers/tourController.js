// const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
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



exports.getAllTours = async (req, res) => {

    // console.log(req.requestTime);
    try{
        // # BUILD QUERY
        // 1 Filtering
        // 1.1 Basic filtering
        // const queryObj = { ...req.query };
        // 出现在这里的检索字段，都会被无视掉。
        // const excludeFields = ['page', 'sort', 'limit', 'fields'];
        // excludeFields.forEach(el => delete queryObj[el]);
        // console.log(req.query, queryObj);

        // // 两种检索方式：

        // // const tours = await Tour.find({
        // //     duraion: 5,
        // //     difficulty: 'easy'
        // // });

        // // const tours = await Tour.find() // return all the documents
        // //     .where('duration')
        // //     .equals(5)
        // //     .where('difficulty')
        // //     .equals('easy');

        // // 1.2 Advanced filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // // console.log(JSON.parse(queryStr));

        // // MongoDB里的形式：{ difficulty: 'easy', duration: { $gte:5 } }
        // // NodeJS的形式：{ difficulty: 'easy', duration: { gte:'5' } }
        // // gte, gt, lte, lt

        // let query = Tour.find(JSON.parse(queryStr)); // 这里要用let而非const，因为query是变量而非常量。

        // 2 Sorting
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     // Mongoose中多字段排序的写法：`sort('price ratingsAverage')`

        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort('-createdAt') // 设置默认顺序为按照创建时间从新到旧。
        //     // sort的值前面加上减号表示降序，例如`sort=-price`
        // }
        // // sort的值前面加上减号表示“降序”，例如`sort=-price`。

        // // 3 Field limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // } else {
        //     query = query.select('-__v');
        //     // field的值前面加上减号表示“不包含”，例如`field=-__v`。
        // }
        // // 也可以直接从schema来排除字段，从而向客户端隐藏字段（在tourModel.js中设置）。

        // // 4 Pagination

        // const page = req.query.page * 1 || 1; // 把默认页数设为1
        // const limit = req.query.limit *1 || 100;
        // const skip = (page-1) * limit;
        // query = query.skip(skip).limit(limit);
        // 处理异常情况
        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip>=numTours) throw new Error('This page does not exist');
        // }


        // # EXECUTE QUERY
        const feature = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await feature.query;
        // `find`返回一个query对象

        // # SEND RESPONSE
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
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }

}

exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            // new参数为true表示return新的document
            runValidators: true
        })

        res
        .status(200)
        .json({
            status: 'success', 
            // result: tours.length,
            data:{
                tour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }

}

exports.deleteTour = async (req, res)=>{
    try{
        await Tour.findByIdAndDelete(req.params.id);
        res
        .status(204)
        .json({
            status: 'delete success', 
            // result: tours.length,
            data: null,
            message: 'Delete success!'
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }    
}

exports.createTour = async (req, res)=>{
    try{
        // 把post传入的参数作为创建mongo文档的数据：
        const newTour = await Tour.create(req.body);
        // create返回一个promise。
        
        res.status(201).json({
            status: 'created! success',
            data:{
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}
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

exports.getTour = async (req, res) => {
    try{
        // 当你在定义 Express 路由时，如果在路由路径中使用了冒号 :，
        // 那么这部分就被认为是一个路由参数，并且 Express 会将这些参数存储在 req.params 对象中。
        const tour = await Tour.findById(req.params.id);
        // `Tour.findById(req.param.id)`等价于`Tour.findOne({_id: req.param.id})`
        res
        .status(200)
        .json({
            status: 'success', 
            // result: tours.length,
            data:{
                tour
            }
        });
    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'invalid!'
        });
    }
    // `:id?`表示可选参数


    // 返回id与req.params完全一直的列表元素。
    // const tour = tours.find(el => el.id === id);

    // if (!tour){
    //     return res.status(404).json({
    //         status: "fail",
    //         message: "Invalid ID"
    //     });
    // };
}

exports.getTourStats = async (req, res) => {
    try {
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
    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}


exports.getMonthlyPlan = async (req, res) => {
    try {
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
    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}