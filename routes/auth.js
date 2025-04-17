const express = require('express');
const User = require('../models/user');
//const expValidator = require('express-validator/check');
// destructuring the package in order to use the check function
const { check, body } = require('express-validator');

const router = express.Router();
authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', 
    [
        body('email', 'Please enter a valid email').isEmail(),
        body('password', 'Password must be at least 5 characters long')
            .isLength({min: 5})
    ],
    authController.postLogin);

router.post('/signup', 
    [
        check('email').isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req}) => {
            if (value === req.body.password) {
                throw new Error('Password cannot be the same as email');
            }
            // add async valdation if user already exist
            return User.findOne({email: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email already exists');
                }
            })           
        }),
        body('password', 'Password must be at least 5 characters long')
            .isLength({min: 5}),
        body('confirmPassword')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match');
            }
            return true;
        })
    ], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:tokenId', authController.getChangePassword);

router.post('/change-password', authController.postChangePassword);

module.exports = router;
 