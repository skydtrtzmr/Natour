const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err=> {
    console.log('UNCAUGHT EXCEPTION!💔 Shutting down...');
    // 务必把err完整打印出来，而非只打印里面某几个字段。否则你都很难排除错误在哪。
    console.log(err);
    process.exit(1);
});

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose
    .connect(DB)
    .then(() => {
        console.log('DB connection successful!');
    })
    .catch(err => console.log('ERROR'));


// testTour 是一个document instance
// const testTour = new Tour({
//     name: 'The Forest Hiker',
//     rating: 4.7,
//     price: 497
// });

// save会返回一个可以consume的promise
// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('Err💥:', err)
// })

// console.log(app.get('env'));
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err=>{
    console.log('UNHANDLED REJECTION!💔 Shutting down...');
    console.log(err.name, err.message);
    server.close(() =>{
        process.exit(1);
    });
});

// console.log(x); // 这行代码是用来测试error的。