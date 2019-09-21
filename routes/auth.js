const express = require('express');
const {
    check,
    body
} = require('express-validator/check')

const authController = require('../controllers/auth');
const User = require('../models/user')

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignUp);

router.post(
    '/login',
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
        body('password', 'Passeord has to be valid')
        .isLength({
            min: 8,
            max: 20,
        })
        .isAlphanumeric()
        .trim()
    ],
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.post(
    '/signup',
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid Email')
        .custom((value, {
            req
        }) => {
            return User.findOne({
                    email: value
                })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already exists !!!')
                    }
                })
        })
        .normalizeEmail(),
        body(
            'password',
            'Please enter a valid AlphaNumeric password with min 8 characters'
        )
        .isLength({
            min: 8,
            max: 20,
        })
        .isAlphanumeric()
        .trim(),
        body('confirmPassword')
        .trim()
        .custom((value, {
            req
        }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match')
            }
            return true;
        })
        
    ],
    authController.postSignUp);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;