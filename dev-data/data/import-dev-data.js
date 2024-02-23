// 这是一个把json数据导入mongo的脚本，一次性使用。
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
    console.log('DB connection successful!');
});

// Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import data into DB
const importData = async () =>{
    try{
        await Tour.create(tours);
        // 这里加上{ validateBeforeSave: false }是因为导入时是没有passwordConfirm这个字段的，
        // 但是我们的Model定义的是要求创建用户必须有passwordConfirm，所以要避开这个验证。
        await User.create(users, { validateBeforeSave: false });
        // 同时，请前往userModel，把密码加密的方法（userSchema.pre('save'）注释掉，来进行导入。
        // 因为数据里的密码已经加密过了，不要再加密一次。导入完后，记得再取消注释。
        await Review.create(reviews);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

// Delete all the data from DB
const deleteData = async () =>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);


// 如何运行这个脚本？
// 命令行：
// `node dev-data/data/import-dev-data.js --delete`
// `node dev-data/data/import-dev-data.js --import`