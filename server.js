const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
    console.log('DB connection successful!');
});


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
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});