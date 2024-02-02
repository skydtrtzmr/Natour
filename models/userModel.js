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
    password: {
        type: String,
        trim: true, // 去除首尾空白
        required: [true, 'Please provide a password!'],
        minlength: 8,
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
    photo: [String]
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

const User = mongoose.model('User', userSchema);

module.exports = User;