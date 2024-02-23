const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowFields) => {
// 作用：从一个对象中挑选出指定的字段，过滤掉其他不需要的字段。
    // 函数接受两个参数：obj是要进行过滤的对象，allowFields是一个包含允许保留的字段的参数列表。
    const newObj = {};
    // 函数通过遍历输入对象的所有键。
    Object.keys(obj).forEach(el => {
        if(allowFields.includes(el)){
            newObj[el] = obj[el];
        }
        // 如果某个键在allowFields数组中，则将该键值对添加到一个新的对象newObj中。
    })
    return newObj;
    // 最后，函数返回这个新的对象。
}

// 作为一个中间件，把当前用户id传递给参数id。
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error uf yser POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError(
            'This route is not for password update, please use /updateMyPassword', 
            400
        ));
    };

    // 2) Filtered out unwanted fields names that are not allowed to be updated.
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 2) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, 
        // 这里是非敏感数据，所以可以直接用findByIdAndUpdate而非像密码一样用save。
        // 我们不希望update所有body里的数据，所以这里的第二个参数不是req.body。
        {
            new: true, 
            runValidators: true
        }
    );

    res
    .status(200)
    .json({
        status: 'success', 
        data:{
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {

    const inactiveUser = await User.findByIdAndUpdate(req.user.id, {active: false});
    res
        .status(204)
        .json({
            status: 'delete success', 
            data: null
        });
});


exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.createUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User); // Do NOT update password with this!

exports.deleteUser = factory.deleteOne(User);


