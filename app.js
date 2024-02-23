/*
    这里只存放和express有关的。express之外的放在server.js文件。
*/

const path = require('path');
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
// const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 因为有时候路径里有斜杠“/”而有时候没有，所以我们需要用这个path.join.

// Serving static files.
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// 设置默认静态文件根目录为public

// 1) Global middlewares
// middleware always before all route handler

// Set security HTTP headers.
app.use(helmet());

// 设为仅在开发环境下使用
// console.log(process.env.NODE_ENV);
// Development logging
if (process.env.NODE_ENV === 'development'){ 
    app.use(morgan('dev'));
}

// Set limit to requests
const limiter = rateLimit({
    // 设置为一小时内限制100个req。
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP!🥵 Please try again in an hour.'
});
app.use('/api', limiter);

// Body parse, reading data from body into req.body.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution（通过清理冗余的查询字符串字段）
app.use(
    hpp({
        whitelist: [// 根据需要可以直接注释白名单行。
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ] 
    })
); 

// app.use((req, res, next) => {
//     console.log('Hello from the middleware 😊!');
//     next();
// });

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies);
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
// app.use('/', viewRouter);
app.get('/', (req, res) => {
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        user: 'Jonas'
    });
});

app.get('/overview', (req, res) => {
    res.status(200).render('overview', {
        title: 'All Tours'
    });
});

app.get('/overview', (req, res) => {
    res.status(200).render('tour', {
        title: 'The Tour'
    });
});

app.use('/api/v1/tours', tourRouter);
// 加上这句之后，所有的tourRouter根路径都变成了这里指定的。
// 后续只需要接着往后指定子路径即可，前面指定过的这部分用“/”表示。
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// 把这个all放最后，这样才能把之前无法正常处理的route都在这里统一处理。
app.all('*', (req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    // 只要在next里面传入了参数，express会假设它是一个error，
    // 并跳过middleware stack中的所有其他middleware，
    // 把error传入global error handling middleware。
});

// 第一个参数是err时，express会自动把它识别为错误处理函数。
app.use(globalErrorHandler);

// 4) run the server

module.exports = app;