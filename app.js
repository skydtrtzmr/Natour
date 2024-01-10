/*
    这里只存放和express有关的。express之外的放在server.js文件。
*/

const express = require('express');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');

const tourRouter = require('./routes/tourRoutes');

const app = express();

// 1) middlewares

// middleware always before all route handler

// 设为仅在开发环境下使用
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development'){ 
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`)); // 设置默认静态文件根目录为public

app.use((req, res, next) => {
    console.log('Hello from the middleware 😊!');
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// app.get('/hello', (req, res)=>{
//     res
//     .status(200)
//     .send('Hello from the server side!');
// });

// app.get('/', (req, res)=>{
//     res
//     .status(200)
//     .json({message:'Hello from the server side!', app:'Natour'});
// });

// app.post('/', (req, res)=>{
//     res.status(200).send('You can post to this endpoint!');
// });


// 2) route handler

// 3) routes



app.use('/api/v1/tours', tourRouter);
// 加上这句之后，所有的tourRouter根路径都变成了这里指定的。
// 后续只需要接着往后指定子路径即可，前面指定过的这部分用“/”表示。
app.use('/api/v1/users', userRouter);

// 4) run the server

module.exports = app;