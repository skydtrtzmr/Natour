const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
    console.log('DB connection successful!');
});

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a name']
    },
});

const Tour = mongoose.model('Tour', tourSchema);

// testTour 是一个document instance
const testTour = new Tour({
    name: 'The Forest Hiker',
    rating: 4.7,
    price: 497
});

// save会返回一个可以consume的promise
testTour.save()

// console.log(app.get('env'));
// console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});