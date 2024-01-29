class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        // 在JavaScript中，Error 类的构造函数具有一个可选的 message 参数，
        // 因此在继承 Error 类时，如果子类的构造函数没有提供 super() 中的 message 参数，
        // 那么默认会使用 Error 类的构造函数中的默认行为，即将 message 设置为一个空字符串。

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? fail : 'error';
    }
}