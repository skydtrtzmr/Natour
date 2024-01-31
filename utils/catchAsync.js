module.exports = catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
        // .catch(err => next(err)) 可以简写成.catch(next)，
        // 因为在Promise的catch中，第一个参数是用于处理错误的回调函数。
        // 这个回调函数的签名是 (err) => {...}，其中 err 是捕获到的错误对象。
    };
};