class AppError extends Error {
    constructor(message, statusCode){
        super(message); // Call `super` in order to call the parnet constructor.
        // 这里参数填`message`是因为它是内置error唯一接受的参数。 

        // 在JavaScript中，Error 类的构造函数具有一个可选的 message 参数，
        // 因此在继承 Error 类时，如果子类的构造函数没有提供 super() 中的 message 参数，
        // 那么默认会使用 Error 类的构造函数中的默认行为，即将 message 设置为一个空字符串。

        this.statusCode = statusCode;

        // 将 statusCode 转换为字符串。
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // `? 'fail' : 'error'` 是一个三元条件运算符，
        // 如果条件为真（HTTP状态码以4开头），则this.status 将被设置为 'fail'，否则为 'error'。
        
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;