
const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
    if (req.params.id * 1 > tours.length){
        return res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        });
    };
    next();
}

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price){
        return res.status(400).json({
            status: "fail",
            message: "Missing name or price"
        });
    };
    next();
}

exports.getAllTours = (req, res)=>{
    console.log(req.requestTime);
    res
    .status(200)
    .json({
        status: 'success', 
        result: tours.length,
        requestTime: req.requestTime,
        data:{
            tours // `tours: tours` 可以简写一下
        }
    });
}

exports.updateTour = (req, res)=>{
    res
    .status(200)
    .json({
        status: 'success', 
        // result: tours.length,
        data:{
            tour: '<Updated tour here...>'
        }
    });
}

exports.deleteTour = (req, res)=>{
    res
    .status(204)
    .json({
        status: 'delete success', 
        // result: tours.length,
        data:null
    });
}

exports.createTour = (req, res)=>{
    // console.log(req.body);

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id: newId }, req.body);

    tours.push(newTour);

    // writeFile这个函数接受三个参数：path, data, callback。
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`, 
        JSON.stringify(tours), 
        err => {
            res.status(201).json({
                status: 'created! success',
                data:{
                    tour: newTour
                }
            });
    });

    // res.send('Oh Yes Done'); 
    // 连着两次发送请求会导致报错：Cannot set headers after they are sent to the client
}

exports.getTour = (req, res)=>{
    // `:id?`表示可选参数
    console.log(req.params);
    // Express会根据路由路径的占位符冒号(:)后面的名称来创建一个对应的属性，该属性将包含实际匹配到的值。
    // 在你的例子中，:id 会创建 req.params.id，如果你将其改为 :sth，则会创建 req.params.sth。

    // `* 1`: 这是一种将字符串转换为数字的简便方法。
    // 在JavaScript中，乘以1是一种常见的将字符串转换为数字的技巧。
    // 这是因为乘法运算符会尝试将其操作数转换为数字。
    // 如果路由参数是一个字符串，通过将其与数字1相乘，可以实现隐式的转换。
    const id = req.params.id * 1;

    // 返回id与req.params完全一直的列表元素。
    const tour = tours.find(el => el.id === id);

    if (!tour){
        return res.status(404).json({
            status: "fail",
            message: "Invalid ID"
        });
    };

    res
    .status(200)
    .json({
        status: 'success', 
        // result: tours.length,
        data:{
            tour
        }
    });
}