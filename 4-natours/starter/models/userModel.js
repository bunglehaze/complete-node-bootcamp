const mongoose = require('mongoose');
const validator = require ('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name']
    },
    email: {
        type: String,
        required: [true, 'A user must have an email address'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'User must have an email address']
    },
    photo: String,
    password: {
        type: String,   
        required: [true, 'A user must have a password'],
        minlength: [8, 'A user password must have at least 6 characters']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must confirm password']
    }  
});

const User = mongoose.model('User', userSchema);
module.exports = User;