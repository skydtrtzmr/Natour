const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        // 注意！不能接受所有字段，只能选择部分字段。
        // 否则有些不该被用户自定义的部分，比如权限，也可以被自定义了。
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
})
