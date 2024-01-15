
// const fs = require('fs');
const Tour = require('./../models/tourModel');
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

exports.getAllTours = async (req, res) =>{
    // console.log(req.requestTime);
    try{
        console.log(req.query);

        // 两种检索方式：

        // const tours = await Tour.find({
        //     duraion: 5,
        //     difficulty: 'easy'
        // });

        // const tours = await Tour.find() // return all the documents
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy');

        const tours = await Tour.find(req.query);

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