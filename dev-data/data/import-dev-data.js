// 这是一个把json数据导入mongo的脚本，一次性使用。
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
    console.log('DB connection successful!');
});

// Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import data into DB
const importData = async () =>{
    try{
        await Tour.create(tours);
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