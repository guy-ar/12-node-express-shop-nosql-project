const express = require('express');
//const expValidator = require('express-validator/check');
// destructuring the package in order to use the check function
const { check } = require('express-validator');

const router = express.Router();
authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', check('email').isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {req}) => {
        if (value === req.body.password) {
            throw new Error('Password cannot be the same as email');
        }
        return true;
    }), authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:tokenId', authController.getChangePassword);

router.post('/change-password', authController.postChangePassword);

module.exports = router;
 