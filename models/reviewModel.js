// review / rating / createAt / ref to tour / ref to user
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./../models/userModel');
const Tour = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Please write down your review.'],
            maxlength: [1000, 'A review must have less or equal than 1000 characters.'],
            minlength: [2, 'A review must have more or equal than 2 characters.'],
        },
        rating:{
            type: Number,
            required: [true, 'A review must have a rating.'],
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false // 将该字段向客户端隐藏
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must belong to a tour.'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user.'],
        },
    },{
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

reviewSchema.index({tour: 1, user: 1}, {unique: true});

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // });
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

// 每次添加评论后才会执行。用来实时更新Rating相关统计数据。
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    // statics函数中，this指向当前model
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }, // 别漏了单引号里的$符号。
            }
        }
    ]);
    console.log(stats);

    if (stats.length > 0) {
        // 这是在异步函数中，所以记得加await！
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else { // 如果没评论了，就设为默认值。
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4
        });
    }

};

// 这里应该用post而非pre，因为pre的的话（也就是在save之前），当前review还没有真的在collection中。
reviewSchema.post('save', function() {
    // 同时注意，post无法访问next，这里不能用next。
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
    // 这里的this.constructor就是后面的Review。
    // 中间件是按照顺序执行的，不能直接在这里用Review.calcAverageRatings(this.tour)。
    // 如果把这个方法放在Review声明之后，那么会导致reviewSchema不包含我们目前这个中间件。
});

// 之前仅仅是在createReview的时候调用calc来更新数据，现在想要在更新和删除的时候也调用。
// findByIdAndUpdate
// findByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function(next) {
    // 通过把变量保存为this的一个属性，来把id从pre中间件传到post中间件。
    // this.r = await this.findOne(); // 注意mongoose8.1.1中这样写不行了。
    // 以下这是从官方文档学的，只有这样才能access the document that will be updated。
    this.r = await this.model.findOne(this.getQuery()); 

    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

// 因为执行了两次相同的query，所以如果不加“.clone()”，执行会报错：Query has been executed ...

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;