const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
    console.log('DB connection successful!');
});

// console.log(app.get('env'));
// console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});