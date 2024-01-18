const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration.']
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A tour must have a group size.']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulity.']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true, // 去除首尾空白
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a image.']
    },
    image: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // 将该字段向客户端隐藏
    },
    // 表该旅程每次旅行的开始时间
    startDates: [Date] // MongoDB会自动尝试解析日期格式的数据。

});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;