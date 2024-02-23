const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');

exports.deleteOne = Model => catchAsync(async (req, res, next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    };

    res
    .status(204)
    .json({
        status: 'delete success', 
        data: {
            "info": "ok"
        }
    }); 
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const modelNameString = String(Model.modelName);

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        // new参数为true表示return新的document
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res
    .status(200)
    .json({
        status: 'success', 
        // result: docs.length,
        data:{
            [modelNameString]: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const modelNameString = String(Model.modelName);
    // 把post传入的参数作为创建mongo文档的数据：
    const doc = await Model.create(req.body);
    // create返回一个promise。
    
    res.status(201).json({
        status: 'created! success',
        data:{
            [modelNameString]: doc
        }
    });
})

exports.getOne = (Model, popOption) => 
    catchAsync(async (req, res, next) => {
        const modelNameString = String(Model.modelName);
        let query = Model.findById(req.params.id);
        if (popOption) query = query.populate(popOption);

        const doc = await query;
        // `Tour.findById(req.param.id)`等价于`Tour.findOne({_id: req.param.id})`

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res
        .status(200)
        .json({
            status: 'success', 
            // result: docs.length,
            data:{
                [modelNameString]: doc
            }
        });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour. (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // # EXECUTE QUERY
    const feature = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const docs = await feature.query;
    // const docs = await feature.query.explain();
    // 用explain()查看执行数据。
    res
        .status(200)
        .json({
            status: 'success', 
            requestTime: req.requestTime,
            result: docs.length,
            data:{
                docs // `docs: docs` 可以简写一下
            }
        });
})