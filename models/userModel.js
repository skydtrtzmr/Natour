const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell me your name.'],
        unique: true,
        trim: true,
        maxlength: [40, 'A user name must have less or equal than 40 characters.'],
        minlength: [2, 'A user name must have more or equal than 10 characters.'],
        // validate: [validator.isAlpha, 'Tour name must only contains characters.']
    },
    slug: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'A tour must have a difficulity.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    photo: [String],
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        trim: true, // 去除首尾空白
        required: [true, 'Please provide a password!'],
        minlength: 8,
        select: false // 让它不出现在output中。
    },
    passwordConfirm: {
        type: String,
        trim: true,
        required: [true, 'Please confirm your password!'],
        validate: {
            // This only work on CREATE and SAVE!
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangeAt: {
        type: Date,
        select: true
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: { 
    // 用户删除账户时，只是先变为inactive状态。直到正式确认才会从数据库删除该用户。
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next){
    // 0nly run this function if password was actually modified
    if(!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm=undefined;
    next();
});

userSchema.pre('save', function(next){
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000 // 提前一秒，以规避时间误差带来的影响。
    next();
});

userSchema.pre(/^find/, function(next){
    // 用正则表达式，在所有find之前筛选出active的文档。
    // this points to the current query.
    this.find({active: { $ne: false }});
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangeAt) { //这里this是document。
        const changedTimeStamp = parseInt(
            this.passwordChangeAt.getTime() / 1000, 
            10
        );
        // console.log(changedTimeStamp, JWTTimestamp);
        return JWTTimestamp < changedTimeStamp;
    }

    // False means NOT changed.
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    // We should never store a plain reset token in our database!
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({resetToken},this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10*60*1000; // 设置令牌在10分钟后过期。

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;