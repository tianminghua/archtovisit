const express = require('express');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const { isLoggedIn } = require('../middleware');
const users = require('../controllers/users')
const router = express.Router();

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login', isLoggedIn)
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', isLoggedIn, users.logout)

module.exports = router;