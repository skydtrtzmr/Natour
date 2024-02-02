const AppError = require('./../utils/appError');

const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);
}

const handleDuplicateFieldDB = err =>{

    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${err.value}. Please use another value.`
    return new AppError(message, 400);
}

const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(el => el.message);
    /* 
    `Object.values(error.errors)`: 
    这一部分将 error.errors 对象中的所有属性值提取为一个数组。
    假设 error.errors 是一个对象，它的属性包含了错误信息，这一步就把所有的错误信息取出来了。

    `.map(el => el.message)`: 
    这一部分对数组中的每个元素应用一个函数，这个函数取每个元素的 message 属性。
    假设 error.errors 对象的每个属性值都是一个包含 message 属性的对象，
    这一步就将每个错误对象中的 message 属性提取出来，最终形成一个包含所有错误信息的数组 errors。
    */

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, res)=>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res)=>{
    // Operational, trust error: send message to client
    console.log(`isOperational：${err.isOperational}`);
    if (err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });

    // Programming or other unknown error: don't leak error detail
    } else{
        // 1) Log error
        console.log('Error 💥');

        // 2) Send generic message
        res.status(err.statusCode).json({            
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);

    } 
    else if (process.env.NODE_ENV === 'production'){
        let error = { ...err, name: err.name };
        // 现版本中，err的name不是可枚举属性，
        // 所以直接用`{ ...err }`这种展开语法浅拷贝是拷贝不到name的，需要手动添加。

        if(error.name === 'CastError') {
            error = handleCastErrorDB(error)
        };
        if(error.code === 11000 ) {
            error = handleDuplicateFieldDB(error)
        };
        if(error.name === 'ValidationError') {
            error = handleValidationErrorDB(error)
        };
        
        sendErrorProd(error, res); // 注意error和err；
        // error到最后是一个我们自己定义的AppError，err是系统默认的类。
    }
};