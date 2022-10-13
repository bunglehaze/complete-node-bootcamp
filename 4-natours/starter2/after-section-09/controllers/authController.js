/* eslint-disable prettier/prettier */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require ('../utils/appError');
const sendEmail = require ('../utils/email');

// eslint-disable-next-line arrow-body-style
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  };

  const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
    status: 'success',
    token,
    data: {
    user
    }
});
}

exports.signup = catchAsync(async (req, res, next) => {
const newUser = await User.create(req.body);
createSendToken(newUser, 201, res);
});

exports.login = catchAsync (async (req, res, next) => {
    const { email, password } = req.body;

      // 1) Check if email and password exist
    if (!email || !password) {
       return next(new AppError('Please provide email and password', 400));
    }

    //check if the user exists
        const user = await User.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Invalid email or password', 401));
    }

        createSendToken(user, 200, res);
        const token = signToken(user._id);
        
        res.status(200).json({
            status: 'success',
            token
        });
    });

    exports.protect = catchAsync(async (req, res, next) => {
        // get the token and check if it's there
        let token;
        if (
            req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')
            ) {
        token = req.headers.authorization.split(' ')[1];    
        }

        if(!token) {
            return next(new AppError('You are not logged in! Please login to get access.', 401
            ))
        }
        //validate the token

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        

        // check if the user still exists

        const currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            return next(new AppError('The user belonging to the token does no longer exist.', 401
            ))
        }
        // check if user changed password after the token was issued

       if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(AppError('The user recently changed password. Please login to get access.', 401)
        );
       }    
 // grant access to protected route
req.user = currentUser;
        next();
    });

    exports.restrictTo = (...roles) => {
        return (req, res, next) => {
            // roles is an array [admin, lead-guide]. role = user
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403)
            );
        }
    next();    
    }
        
    };

    exports.forgotPassword = catchAsync (async(req, res, next) => {
        // 1 get user based on posted email
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return next(new AppError('User not found with that email address', 404));
        }
        // 2 generate the random token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave : false});
        // send it back as an email
        const resetURL = `${req.protocol}://${req.get(
            'host'
            )}/api/v1/user/resetPassword/${resetToken}`;

            const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\n If you didn't forget your password then ignore this email`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'your password reset token valid for 10 minutes',
                    message
                 });
                 res.status(200).json({
                     status: 'Success',
                     message: 'Token sent to email'
                 });
            } catch (err) {
                user.passwordResetToken = undefined;
                user.passwordExpires = undefined;
                await user.save({ validateBeforeSave : false});

                return next(new Error('There was an error  sending the email. Try again later!'), 
                500);
            };

    });
    exports.resetPassword = catchAsync(async(req,res,next) => {
//1 get user based on the token

const hashedToken = crypto
.createHash('sha256')
.update(req.params.token)
.digest('hex');

const user = await  User.findOne({
    passwordResetToken: hashedToken, 
    passwordResetExpires: {$gt: Date.now()}
});

//2 if the token has not expired, and there is a user, set the new password
if (!user) {
    return next(new Error('Token is invalid or has expired', 400))
}
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();
    //3  update changed passwordAt property for the user

//4 log the user in , send JWT 
createSendToken(user, 200, res);
const token = signToken(user._id);
        
        res.status(200).json({
            status: 'success',
            token
        });
    });

    exports.updatePassword = catchAsync(async (req, res, next) => {
        //1 get the user from collection
        const user = await User.findById( req.user.id ).select('+password');
        //2 check if posted current password is correct
        if(!(user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Your current password is incorrect', 401))
        }
        //3 if so, update the password
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
await user.save();

//user findByIdAndUpdate would not work

        //4 log user in, send jwt
        createSendToken(user, 200, res);
    });
