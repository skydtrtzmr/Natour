const {promisify} = require('util');
/*
在 const { promisify } = require('util'); 这行代码中，花括号 {} 被用于进行解构赋值。
这是一种从对象中提取属性的语法。
在这个特定的例子中，promisify 是 util 模块中的一个函数，
而通过 { promisify } 的语法，它被从 util 对象中提取出来，然后赋值给一个同名的变量 promisify。
*/
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign(
        {id: id}, 
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRES_IN}
    );
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    // 第一个参数是payload。
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000
        ),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt', token, cookieOptions)

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        // 注意！不能接受所有字段，只能选择部分字段。
        // 否则有些不该被用户自定义的部分，比如权限，也可以被自定义了。
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangeAt: req.body.passwordChangeAt,
        role: req.body.role
    });
    createSendToken(newUser, 201, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    // 1) Check if email and password exist.
    if (!email || !password) {
        next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exist & password is correct.
    const user = await User.findOne({email}).select('+password');
    // Mongoose 在字段名前添加 + 或 - 符号,用来指定是否包含或排除该字段。
    // 使用 + 符号，如 .select('+password')，表示选择该字段(即使在模型的定义中可能被默认排除)。

    if (!user || !(await user.correctPassword(password, user.password))) {
        // 如果用户不存在，或者用户密码不正确
        return next(new AppError('Incorrect email or password!', 401));
    };

    // 3) If everything ok, send token to client.
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError(
            'You are not logged in! Please log in to get access.', 
            401
        ));
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) Check if user still exists
    console.log(decoded);
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist!',
                401
            )
        );
    };

    // 4) Check if user change password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)){
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    };

    // Grant access to protected route.
    req.user = currentUser;
    // 数据只有放在req对象中，才会随着中间件一步步向后传递。

    next();
});

exports.restricTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin','lead-guide'], role='user'
        console.log(roles);
        console.log(req.user.role);
        if(!roles.includes(req.user.role)){
            return next(
                new AppError(
                    'You do not have permission to this action!',
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email.
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with this email address!⚗️', 404));
    }
    // 2) Generate the random reset token.
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); 
    // user是一个document，save是document的方法。
    // Deactive all the validaters that we specified in our schema.

    // 3) Send it to user's email.
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? 
        Submit a PATCH request with your new password and passwordConfirm to: 
        ${resetURL}\n
        If you didn't forget your password, please ignore this email.`

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10min).',
            message
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false }); 

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token.
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ 
        passwordResetToken: hashedToken, 
        passwordResetExpires: { $gt: Date.now() }
    });
    // 2) If token has not expired, and there is user, set the new password.
    if (!user){
        return next(new AppError(
            'Token is invalid or expired!',
            400
        ));
    };
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save(); // 这里用save而不是update是为了用validator。

    // 3) Update changedPasswordAt property for the user.

    // 4) Log the user in, send JWT.
    
    createSendToken(User, 200, res);

});

exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) Get user from collection.
    // This function is only for logged in user.
    // const user = await User.findOne({_id: req.user.id}).select('+password');
    const user = await User.findById(req.user.id).select('+password');
    console.log("密码是：");

    // 2) Check if POSTed current password is correct.
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('You current password is wrong.', 401))
    }

    // 3) If so, update password.
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 为什么不用user.findByIdAndUpdate？
    // 因为如果改用这个的话，a. validator不会执行；b. 此外，pre('save')函数也无法执行。
    

    // 4) Log user in, send JWT.
    createSendToken(user, 200, res);
});