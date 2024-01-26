const mongoose = require('mongoose');
const slugify = require('slugify');

// mongoose.Schema 的参数可以分为两部分：文档定义和选项设置。
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    slug: {
        type: String
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
        // required: [true, 'A tour must have a image.']
    },
    image: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // 将该字段向客户端隐藏
    },
    // 表该旅程每次旅行的开始时间
    startDates: [Date] // MongoDB会自动尝试解析日期格式的数据。

},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
    // toJSON: { virtuals: true }： 这个选项表示在将 MongoDB 文档转换为 JSON 格式时，包括虚拟属性的值。
    // 如果设置为 true，那么在调用 JSON.stringify() 将文档转为 JSON 时，会包含虚拟属性的值。
    // 默认情况下，虚拟属性不会被包括在 JSON 中。

    // toObject: { virtuals: true }： 这个选项表示在将 MongoDB 文档转换为普通 JavaScript 对象时，也包括虚拟属性的值。
    // 如果设置为 true，在使用 Mongoose 的 .toObject() 方法将文档转为普通 JavaScript 对象时，会包含虚拟属性的值。
    // 默认情况下，虚拟属性不会被包括在普通 JavaScript 对象中。
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7 // 这里的`this`指向当前文档。
}) // 当您访问 durationWeeks 属性时，这个函数会被调用。
// 虚拟属性不是database的一部分，所以不能用于query。

// Document middleware: runs before `.save()` and `.create()`.
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
})

tourSchema.pre('save', function(next){
    console.log("Will save document...");
    next();
})

tourSchema.post('save', function(doc, next){
    console.log(doc);
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;